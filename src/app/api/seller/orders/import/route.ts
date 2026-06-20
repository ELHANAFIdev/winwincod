import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { sendToOzon } from "@/lib/ozonExpress";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER") return errorResponse("غير مصرح", 401);

    const { orders, productId } = await req.json();

    if (!orders || orders.length === 0) return errorResponse("الملف فارغ", 400);
    if (!productId) return errorResponse("يجب تحديد المنتج", 400);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return errorResponse("المنتج غير موجود", 404);

    const totalQuantity = orders.reduce((sum: number, o: any) => sum + Number(o.quantity || 1), 0);
    if (product.stock < totalQuantity) {
      return errorResponse(`عذراً، المخزون المتوفر (${product.stock}) لا يكفي لطلب ${totalQuantity} قطعة`, 400);
    }

    const formattedOrders = orders.map((o: any) => ({
      sellerId: user.id,
      productId: productId,
      customerName: o.name?.toString() || "بدون اسم",
      customerPhone: o.phone?.toString() || "",
      address: o.address?.toString() || "",
      city: o.city?.toString() || "",
      productName: product.name,
      quantity: Number(o.quantity) || 1,
      codAmount: Number(o.price) || Number(product.marketPrice),
      status: "DRAFT",
      updatedAt: new Date(),
    }));

    // createManyAndReturn to get IDs for Ozon tracking
    const created = await prisma.order.createManyAndReturn({
      data: formattedOrders,
      select: { id: true, customerName: true, customerPhone: true, city: true, address: true, codAmount: true },
    });

    // Send each order to Ozon in parallel — save tracking numbers where received
    await Promise.allSettled(
      created.map(async (order) => {
        const trackingNumber = await sendToOzon({
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          city: order.city,
          address: order.address,
          codAmount: Number(order.codAmount),
        });
        if (trackingNumber) {
          await prisma.order.update({ where: { id: order.id }, data: { trackingNumber } });
        }
      })
    );

    return NextResponse.json({
      success: true,
      count: created.length,
      message: `تم استيراد ${created.length} طلب بنجاح ✅`,
    });
  } catch (error: any) {
    console.error("Import Error:", error);
    return errorResponse("فشل الاستيراد: تأكد من تنسيق الملف", 500);
  }
}
