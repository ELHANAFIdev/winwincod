import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { z } from "zod";
import { notifyOrderStatusChanged } from "@/services/notificationService";

const schema = z.object({
  orderIds: z.array(z.string()).min(1),
});

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") return errorResponse("غير مصرح", 401);

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return errorResponse("بيانات غير صالحة", 400);

    const { orderIds } = parsed.data;

    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds }, status: "PROCESSING" },
      select: { id: true, productId: true, quantity: true, sellerId: true },
    });

    if (orders.length === 0) return errorResponse("لا توجد طلبات قيد الانتظار لإرسالها", 400);

    await prisma.$transaction(async (tx) => {
      for (const o of orders) {
        if (o.productId) {
          await tx.product.update({
            where: { id: o.productId },
            data: { stock: { decrement: o.quantity } },
          });
        }
      }
      await tx.order.updateMany({
        where: { id: { in: orders.map((o) => o.id) } },
        data: { status: "SHIPPED", updatedAt: new Date() },
      });
    });

    // Notify each seller their order is shipped (fire-and-forget)
    for (const o of orders) {
      notifyOrderStatusChanged(o.sellerId, o.id, "SHIPPED");
    }

    return NextResponse.json({
      success: true,
      dispatched: orders.length,
      message: `تم إرسال ${orders.length} طلب للتوصيل`,
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
