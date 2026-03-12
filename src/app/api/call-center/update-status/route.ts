import { NextResponse } from "next/server";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "CALL_CENTER" && user.role !== "ADMIN")) {
      return errorResponse("غير مصرح", 401);
    }

    const { orderId, status } = await req.json();

    // 1. جلب الطلب مع بيانات المنتج المرتبط به
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        product: true, // سحب بيانات المنتج (السعر)
        batch: true 
      }
    });

    if (!currentOrder) return errorResponse("الطلب غير موجود", 404);

    // 2. تحديث حالة الطلب
    await prisma.order.update({
      where: { id: orderId },
      data: { status, updatedAt: new Date() }
    });

    // 3. الحساب المالي الذكي عند التأكيد
    if (status === "CONFIRMED" && currentOrder.batchId) {
      // إذا كان هناك منتج مرتبط، نأخذ سعره، وإلا نستخدم 150 كاحتياط
      const pricePerItem = currentOrder.product 
        ? Number(currentOrder.product.sellerPrice) 
        : 150;

      const totalOrderCost = currentOrder.quantity * pricePerItem;

      // تحديث إجمالي الدفعة
      await prisma.orderbatch.update({
        where: { id: currentOrder.batchId },
        data: {
          totalAmount: { increment: totalOrderCost }
        }
      });
    }

    // 4. تحويل الحالة لـ WAITING_PAYMENT إذا اكتملت الدفعة
    if (currentOrder.batchId) {
      const remaining = await prisma.order.count({
        where: { batchId: currentOrder.batchId, status: "PENDING_CONFIRMATION" }
      });

      if (remaining === 0) {
        await prisma.order.updateMany({
          where: { batchId: currentOrder.batchId, status: "CONFIRMED" },
          data: { status: "WAITING_PAYMENT" }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}