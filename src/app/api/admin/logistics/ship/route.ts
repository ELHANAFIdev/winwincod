import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") return errorResponse("غير مصرح", 401);

    const { batchId } = await req.json();

    // نستخدم $transaction لضمان تنفيذ كل العمليات أو إلغائها معاً
    await prisma.$transaction(async (tx) => {
      // 1. جلب الطلبات الموجودة في هذه الدفعة
      // ملاحظة: استخدمنا tx.order (حروف صغيرة)
      const orders = await tx.order.findMany({
        where: { batchId: batchId },
        select: { productId: true, quantity: true }
      });

      // 2. تحديث المخزون لكل منتج
      for (const item of orders) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity // ينقص المخزون بمقدار الكمية المباعة
              }
            }
          });
        }
      }

      // 3. تحديث حالة الطلبات في الدفعة إلى مشحون SHIPPED
      await tx.order.updateMany({
        where: { batchId: batchId },
        data: { 
          status: 'SHIPPED',
          updatedAt: new Date()
        }
      });
    });

    return NextResponse.json({ success: true, message: "تم الشحن وتحديث المخزون بنجاح ✅" });
  } catch (error: any) {
    console.error("Shipping Error:", error);
    return errorResponse("فشل تحديث المخزون: " + error.message, 500);
  }
}