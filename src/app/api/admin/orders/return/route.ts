import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { z } from "zod";

const schema = z.object({ orderId: z.string() });

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") return errorResponse("غير مصرح", 401);

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return errorResponse("بيانات غير صالحة", 400);

    const { orderId } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, productId: true, quantity: true, sellerId: true },
    });

    if (!order) return errorResponse("الطلب غير موجود", 404);
    if (order.status !== "SHIPPED") return errorResponse("الطلب ليس في حالة شحن", 400);

    await prisma.$transaction(async (tx) => {
      // Mark as RETURNED
      await tx.order.update({
        where: { id: orderId },
        data: { status: "RETURNED", updatedAt: new Date() },
      });

      // Restore stock
      if (order.productId) {
        await tx.product.update({
          where: { id: order.productId },
          data: { stock: { increment: order.quantity } },
        });
      }
    });

    return NextResponse.json({ success: true, message: "تم تسجيل المرجع وإعادة المخزون" });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
