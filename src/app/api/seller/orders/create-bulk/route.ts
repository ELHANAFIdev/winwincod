import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { z } from "zod";

const orderSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  address: z.string().min(3),
  city: z.string().min(1),
  codAmount: z.coerce.number().min(0),
});

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER") return errorResponse("غير مصرح", 401);

    const body = await req.json();
    const parsed = z.object({ orders: z.array(orderSchema).min(1) }).safeParse(body);
    if (!parsed.success) return errorResponse("بيانات غير صحيحة", 400);

    const { orders } = parsed.data;

    // Aggregate quantity needed per product
    const needed: Record<string, number> = {};
    for (const o of orders) needed[o.productId] = (needed[o.productId] || 0) + o.quantity;

    const products = await prisma.product.findMany({
      where: { id: { in: Object.keys(needed) } },
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    for (const [pid, qty] of Object.entries(needed)) {
      const p = productMap.get(pid);
      if (!p) return errorResponse("منتج غير موجود", 400);
      if (p.stock < qty) return errorResponse(`المخزون غير كافٍ: ${p.name} (متوفر: ${p.stock})`, 400);
    }

    const created = await prisma.$transaction(
      orders.map(o =>
        prisma.order.create({
          data: {
            sellerId: user.id,
            productId: o.productId,
            productName: o.productName,
            customerName: o.customerName,
            customerPhone: o.customerPhone,
            address: o.address,
            city: o.city,
            quantity: o.quantity,
            codAmount: o.codAmount,
            status: "DRAFT",
            updatedAt: new Date(),
          },
        })
      )
    );

    return NextResponse.json({ success: true, orderIds: created.map(o => o.id) });
  } catch (error: any) {
    console.error("[create-bulk]", error);
    return errorResponse(error.message, 500);
  }
}
