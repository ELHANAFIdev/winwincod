import prisma from "@/lib/prisma";

export async function creditWallet(
  userId: string,
  amount: number,
  type: any,
  refId?: string,
  description?: string
) {
  return await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.update({
      where: { userId },
      data: { balance: { increment: amount } },
    });

    await tx.transaction.create({
      data: { walletId: wallet.id, amount, type, referenceId: refId, description },
    });

    return wallet;
  });
}

export async function chargeWallet(
  userId: string,
  amount: number,
  type: any,
  refId?: string,
  description?: string
) {
  return await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUniqueOrThrow({ where: { userId } });

    if (Number(wallet.balance) < amount) {
      throw new Error("رصيد المحفظة غير كافٍ");
    }

    const updatedWallet = await tx.wallet.update({
      where: { userId },
      data: { balance: { decrement: amount } },
    });

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        amount: -amount,
        type,
        referenceId: refId,
        description,
      },
    });

    return updatedWallet;
  });
}

// ─── Deposit flow ────────────────────────────────────────────────────────────

export async function createDepositRequest(
  sellerId: string,
  amount: number,
  receiptUrl: string
) {
  return prisma.depositrequest.create({
    data: { sellerId, amount, receiptImage: receiptUrl, status: "PENDING" },
  });
}

export async function approveDeposit(depositId: string) {
  const deposit = await prisma.depositrequest.findUnique({
    where: { id: depositId },
  });

  if (!deposit) throw new Error("طلب الشحن غير موجود");
  if (deposit.status !== "PENDING") throw new Error("تمت معالجة هذا الطلب مسبقاً");

  return prisma.$transaction(async (tx) => {
    await tx.depositrequest.update({
      where: { id: depositId },
      data: { status: "APPROVED" },
    });

    const wallet = await tx.wallet.update({
      where: { userId: deposit.sellerId },
      data: { balance: { increment: deposit.amount } },
    });

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        amount: deposit.amount,
        type: "DEPOSIT",
        referenceId: depositId,
        description: `شحن رصيد معتمد - طلب رقم ${depositId.slice(-6)}`,
      },
    });

    return wallet;
  });
}

export async function rejectDeposit(depositId: string, reason: string) {
  const deposit = await prisma.depositrequest.findUnique({
    where: { id: depositId },
  });

  if (!deposit) throw new Error("طلب الشحن غير موجود");
  if (deposit.status !== "PENDING") throw new Error("تمت معالجة هذا الطلب مسبقاً");

  return prisma.depositrequest.update({
    where: { id: depositId },
    data: { status: "REJECTED", notes: reason },
  });
}

// ─── Order deduction ─────────────────────────────────────────────────────────

export async function deductForOrder(
  sellerId: string,
  orderId: string,
  shippingFee: number,
  productCost: number
) {
  const total = shippingFee + productCost;

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUniqueOrThrow({ where: { userId: sellerId } });

    if (Number(wallet.balance) < total) {
      throw new Error("رصيد غير كافٍ، يرجى شحن محفظتك");
    }

    const updatedWallet = await tx.wallet.update({
      where: { userId: sellerId },
      data: { balance: { decrement: total } },
    });

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        amount: -total,
        type: "ORDER_PAYMENT",
        referenceId: orderId,
        description: `خصم الطلب - تكلفة ${productCost} د.م + شحن ${shippingFee} د.م`,
      },
    });

    return updatedWallet;
  });
}

// ─── Profit credit (on delivery) ─────────────────────────────────────────────

export async function creditProfit(
  sellerId: string,
  orderId: string,
  sellingPrice: number,
  productCost: number,
  shippingFee: number
) {
  const profit = sellingPrice - productCost - shippingFee;

  if (profit <= 0) return null;

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.update({
      where: { userId: sellerId },
      data: { balance: { increment: profit } },
    });

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        amount: profit,
        type: "DELIVERY_PROFIT",
        referenceId: orderId,
        description: `ربح التوصيل - بيع ${sellingPrice} - تكلفة ${productCost} - شحن ${shippingFee} = ${profit} د.م`,
      },
    });

    return wallet;
  });
}

// ─── Wallet history (merged deposits + transactions, paginated) ───────────────

export type WalletHistoryItem = {
  id: string;
  type: "DEPOSIT" | "DEDUCTION" | "PROFIT" | "REFUND" | "WITHDRAWAL";
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "AUTO";
  note: string | null;
  receiptUrl: string | null;
  orderId: string | null;
  createdAt: Date;
};

const DEPOSIT_TYPE_MAP: Record<string, WalletHistoryItem["type"]> = {
  ORDER_PAYMENT: "DEDUCTION",
  SHIPPING_PAYMENT: "DEDUCTION",
  DELIVERY_PROFIT: "PROFIT",
  REFUND_RETURN: "REFUND",
  WITHDRAWAL: "WITHDRAWAL",
};

export async function getWalletHistory(
  sellerId: string,
  page = 1,
  limit = 20
): Promise<{ items: WalletHistoryItem[]; total: number; totalPages: number }> {
  const wallet = await prisma.wallet.findUnique({ where: { userId: sellerId } });

  const [deposits, txns] = await Promise.all([
    prisma.depositrequest.findMany({
      where: { sellerId },
      orderBy: { createdAt: "desc" },
    }),
    wallet
      ? prisma.transaction.findMany({
          where: {
            walletId: wallet.id,
            type: { not: "DEPOSIT" }, // deposits shown via depositrequest
          },
          orderBy: { createdAt: "desc" },
        })
      : [],
  ]);

  const depositItems: WalletHistoryItem[] = deposits.map((d) => ({
    id: d.id,
    type: "DEPOSIT",
    amount: Number(d.amount),
    status: d.status as WalletHistoryItem["status"],
    note: d.notes,
    receiptUrl: d.receiptImage,
    orderId: null,
    createdAt: d.createdAt,
  }));

  const txnItems: WalletHistoryItem[] = txns.map((t) => ({
    id: t.id,
    type: DEPOSIT_TYPE_MAP[t.type] ?? "DEDUCTION",
    amount: Number(t.amount),
    status: "AUTO",
    note: t.description,
    receiptUrl: null,
    orderId: t.referenceId ?? null,
    createdAt: t.createdAt,
  }));

  const all = [...depositItems, ...txnItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const total = all.length;
  const items = all.slice((page - 1) * limit, page * limit);

  return { items, total, totalPages: Math.ceil(total / limit) };
}

// ─── Stats helper ─────────────────────────────────────────────────────────────

export async function getWalletStats(sellerId: string) {
  const wallet = await prisma.wallet.findUnique({ where: { userId: sellerId } });

  const [depositSum, deductionSum, profitSum] = await Promise.all([
    // Total approved deposits
    prisma.depositrequest.aggregate({
      where: { sellerId, status: "APPROVED" },
      _sum: { amount: true },
    }),
    // Total deductions (negative amounts from order transactions)
    wallet
      ? prisma.transaction.aggregate({
          where: {
            walletId: wallet.id,
            type: { in: ["ORDER_PAYMENT", "SHIPPING_PAYMENT"] },
          },
          _sum: { amount: true },
        })
      : { _sum: { amount: null } },
    // Total profits
    wallet
      ? prisma.transaction.aggregate({
          where: { walletId: wallet.id, type: "DELIVERY_PROFIT" },
          _sum: { amount: true },
        })
      : { _sum: { amount: null } },
  ]);

  return {
    totalDeposits: Number(depositSum._sum.amount ?? 0),
    totalDeductions: Math.abs(Number(deductionSum._sum.amount ?? 0)),
    totalProfits: Number(profitSum._sum.amount ?? 0),
  };
}
