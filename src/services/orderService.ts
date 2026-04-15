import prisma from "@/lib/prisma";
import { chargeWallet } from "./walletService";

export async function createBatch(sellerId: string, orderIds: string[]) {
  if (orderIds.length < 5) {
    throw new Error("الحد الأدنى لإنشاء دفعة هو 5 طلبات");
  }

  const countValid = await prisma.order.count({
    where: { 
      id: { in: orderIds },
      sellerId: sellerId,
      batchId: null, 
      status: 'DRAFT'
    }
  });

  if (countValid !== orderIds.length) {
    throw new Error("بعض الطلبات غير صالحة أو تم إرسالها مسبقاً");
  }

   return await prisma.$transaction(async (tx) => {
    // 1. إنشاء الدفعة
    const batch = await tx.orderbatch.create({
      data: {
        sellerId,
        totalAmount: 0, 
        isPaid: false,
      }
    });

    // 2. تحديث الطلبات
    await tx.order.updateMany({
      where: { 
        id: { in: orderIds },
        sellerId: sellerId
      },
      data: { 
        batchId: batch.id, 
        status: 'PENDING_CONFIRMATION',
        updatedAt: new Date()
      }
    });

    // 3. إضافة سجل التتبع (OrderStatusHistory)
    await tx.orderStatusHistory.createMany({
      data: orderIds.map(id => ({
        orderId: id,
        status: 'PENDING_CONFIRMATION',
        userId: sellerId
      }))
    });

    return batch;
  });
}

export async function payBatchFromWallet(sellerId: string, batchId: string) {
  const batch = await prisma.orderbatch.findUniqueOrThrow({
    where: { id: batchId, sellerId }
  });

  if (batch.isPaid) throw new Error("تم دفع هذه الدفعة مسبقاً");
  
  await chargeWallet(
    sellerId, 
    Number(batch.totalAmount), 
    'ORDER_PAYMENT', 
    batch.id
  );

  await prisma.$transaction([
    prisma.orderbatch.update({
      where: { id: batchId },
      data: { isPaid: true }
    }),
    prisma.order.updateMany({
      where: { batchId: batchId, status: 'WAITING_PAYMENT' },
      data: { 
        status: 'PROCESSING',
        updatedAt: new Date()
      }
    })
  ]);

  // يجب جلب الايديات لتسجيل التتبع
  const updatedOrders = await prisma.order.findMany({
    where: { batchId: batchId, status: 'PROCESSING' }
  });

  if (updatedOrders.length > 0) {
    await prisma.orderStatusHistory.createMany({
      data: updatedOrders.map(o => ({
        orderId: o.id,
        status: 'PROCESSING',
        userId: sellerId
      }))
    });
  }

  return true;
}