import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { creditWallet } from "@/services/walletService";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") return errorResponse("غير مصرح", 401);

    const { orderId, status } = await req.json(); // status: 'DELIVERED' or 'RETURNED'

    if (!['DELIVERED', 'RETURNED'].includes(status)) {
        return errorResponse("حالة غير صالحة", 400);
    }

    // 1. جلب الطلب لمعرفة السعر والبائع
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true }
    });

    if (!order) return errorResponse("الطلب غير موجود", 404);
    if (order.status === 'DELIVERED' || order.status === 'RETURNED') {
        return errorResponse("تم تحديث حالة هذا الطلب مسبقاً", 400);
    }

    // 2. تحديث الحالة في قاعدة البيانات
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: status,
        updatedAt: new Date()
      }
    });

    // 3. (هام جداً) منطق المرتجع: إعادة المال للمحفظة
  if (status === 'RETURNED') {
  await prisma.$transaction(async (tx) => {
    // 1. تحديث حالة الطلب
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'RETURNED' }
    });

    // 2. إعادة القطعة للمخزون
    if (order.productId) {
      await tx.product.update({
        where: { id: order.productId },
        data: { stock: { increment: order.quantity } }
      });
    }

    // 3. إعادة المال لمحفظة البائع (سعر التكلفة)
    const refund = Number(order.product?.sellerPrice || 0) * order.quantity;
    await tx.wallet.update({
      where: { userId: order.sellerId },
      data: { balance: { increment: refund } }
    });
  });
}
    return NextResponse.json({ success: true, message: `تم تحديث الطلب إلى ${status}` });

  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}