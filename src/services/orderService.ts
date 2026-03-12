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

    // 2. تحديث الطلبات (هذا هو السطر الذي يجعلها تظهر في الكول سنتر)
    await tx.order.updateMany({
      where: { 
        id: { in: orderIds },
        sellerId: sellerId // زيادة في الأمان
      },
      data: { 
        batchId: batch.id, 
        status: 'PENDING_CONFIRMATION', // 👈 التأكد من تغيير الحالة هنا
        updatedAt: new Date()
      }
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

  return true;
}