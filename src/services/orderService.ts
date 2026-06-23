import prisma from "@/lib/prisma";

// Flat shipping fee charged to the seller per order (matches COMMISSION in deliver route)
const SHIPPING_FEE_PER_ORDER = 20; // MAD

export async function createBatch(sellerId: string, orderIds: string[]) {
  if (orderIds.length < 1) {
    throw new Error("يجب اختيار طلب واحد على الأقل");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch valid DRAFT orders for this seller that are not yet in a batch
    const orders = await tx.order.findMany({
      where: {
        id: { in: orderIds },
        sellerId,
        batchId: null,
        status: "DRAFT",
      },
      include: { product: { select: { sellerPrice: true } } },
    });

    if (orders.length !== orderIds.length) {
      throw new Error("بعض الطلبات غير صالحة أو تم إرسالها مسبقاً");
    }

    // 2. Calculate total cost: (productCost + shippingFee) per order
    let totalAmount = 0;
    for (const o of orders) {
      const productCost = Number(o.product?.sellerPrice ?? 0) * o.quantity;
      totalAmount += productCost + SHIPPING_FEE_PER_ORDER;
    }

    // 3. Check wallet balance before proceeding
    const wallet = await tx.wallet.findUnique({ where: { userId: sellerId } });
    const currentBalance = Number(wallet?.balance ?? 0);

    if (currentBalance < totalAmount) {
      throw new Error(
        `رصيد غير كافٍ، يرجى شحن محفظتك. المبلغ المطلوب: ${totalAmount.toFixed(2)} د.م، رصيدك الحالي: ${currentBalance.toFixed(2)} د.م`
      );
    }

    // 4. Create the batch (mark as paid since deduction happens now)
    const batch = await tx.orderbatch.create({
      data: { sellerId, totalAmount, isPaid: true },
    });

    // 5. Update each order: assign to batch, set shippingFee, move to PROCESSING
    for (const o of orders) {
      await tx.order.update({
        where: { id: o.id },
        data: {
          batchId: batch.id,
          status: "PROCESSING",
          shippingFee: SHIPPING_FEE_PER_ORDER,
          updatedAt: new Date(),
        },
      });
    }

    // 6. Deduct from wallet
    const updatedWallet = await tx.wallet.update({
      where: { userId: sellerId },
      data: { balance: { decrement: totalAmount } },
    });

    // 7. Log the deduction as a single transaction for the batch
    await tx.transaction.create({
      data: {
        walletId: updatedWallet.id,
        amount: -totalAmount,
        type: "ORDER_PAYMENT",
        referenceId: batch.id,
        description: `خصم دفعة ${orders.length} طلب — تكلفة المنتجات + رسوم الشحن`,
      },
    });

    // 8. Status history
    await tx.orderStatusHistory.createMany({
      data: orderIds.map((id) => ({
        orderId: id,
        status: "PROCESSING" as const,
        userId: sellerId,
      })),
    });

    return batch;
  });
}

// Kept for backward compatibility — batch is already paid at creation
export async function payBatchFromWallet(sellerId: string, batchId: string) {
  const batch = await prisma.orderbatch.findUniqueOrThrow({
    where: { id: batchId, sellerId },
  });

  if (batch.isPaid) {
    // Already paid at batch creation — nothing to do
    return true;
  }

  // Legacy path: deduct and mark paid
  await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUniqueOrThrow({ where: { userId: sellerId } });

    if (Number(wallet.balance) < Number(batch.totalAmount)) {
      throw new Error("رصيد المحفظة غير كافٍ");
    }

    await tx.wallet.update({
      where: { userId: sellerId },
      data: { balance: { decrement: batch.totalAmount } },
    });

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        amount: -Number(batch.totalAmount),
        type: "ORDER_PAYMENT",
        referenceId: batch.id,
      },
    });

    await tx.orderbatch.update({
      where: { id: batchId },
      data: { isPaid: true },
    });

    await tx.order.updateMany({
      where: { batchId, status: "WAITING_PAYMENT" },
      data: { status: "PROCESSING", updatedAt: new Date() },
    });
  });

  return true;
}
