import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { z } from "zod";
import { sendToOzon } from "@/lib/ozonExpress";

const createOrderSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  address: z.string().min(5),
  city: z.string(),
  productName: z.string(),
  productId: z.string().min(1),
  quantity: z.coerce.number().min(1),
  codAmount: z.coerce.number().min(0),
});

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER") {
      return errorResponse("غير مصرح لك", 401);
    }

    const body = await req.json();

    const validation = createOrderSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("بيانات غير مكتملة أو غير صحيحة", 400);
    }

    const { data } = validation;

    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product || product.stock < data.quantity) {
      return errorResponse(`عذراً، الكمية المتوفرة في المخزن (${product?.stock || 0}) غير كافية`, 400);
    }

    const newOrder = await prisma.order.create({
      data: {
        sellerId: user.id,
        productId: data.productId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        address: data.address,
        city: data.city,
        productName: data.productName,
        quantity: data.quantity,
        codAmount: data.codAmount,
        status: "DRAFT",
        updatedAt: new Date(),
      },
    });

    // Send to Ozon Express — save tracking number if received
    try {
      const trackingNumber = await sendToOzon({
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        city: data.city,
        address: data.address,
        codAmount: data.codAmount,
      });
      if (trackingNumber) {
        await prisma.order.update({
          where: { id: newOrder.id },
          data: { trackingNumber },
        });
      }
    } catch {}

    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (error: any) {
    console.error("Server Error:", error);
    return errorResponse("حدث خطأ في الخادم أثناء معالجة الطلب", 500);
  }
}
