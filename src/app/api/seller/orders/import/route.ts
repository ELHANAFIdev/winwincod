import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER") return errorResponse("غير مصرح", 401);

    const { orders, productId } = await req.json();

    if (!orders || orders.length === 0) return errorResponse("الملف فارغ", 400);
    if (!productId) return errorResponse("يجب تحديد المنتج", 400);

    // 1. التحقق من المنتج والمخزون
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return errorResponse("المنتج غير موجود", 404);

    // حساب إجمالي الكمية المطلوبة في الملف
    const totalQuantity = orders.reduce((sum: number, o: any) => sum + Number(o.quantity || 1), 0);

    if (product.stock < totalQuantity) {
      return errorResponse(`عذراً، المخزون المتوفر (${product.stock}) لا يكفي لطلب ${totalQuantity} قطعة`, 400);
    }

    // 2. تجهيز البيانات للإدخال
    // نستخدم map لتحويل البيانات الخام إلى شكل قاعدة البيانات
    const formattedOrders = orders.map((o: any) => ({
      sellerId: user.id,
      productId: productId,
      customerName: o.name?.toString() || "بدون اسم",
      customerPhone: o.phone?.toString() || "",
      address: o.address?.toString() || "",
      city: o.city?.toString() || "",
      productName: product.name, // تثبيت الاسم
      quantity: Number(o.quantity) || 1,
      codAmount: Number(o.price) || Number(product.marketPrice),
      status: "DRAFT", // تدخل كمسودة أولاً
      updatedAt: new Date(),
    }));

    // 3. الإدخال الجماعي (أسرع بكثير من حلقة for)
    await prisma.order.createMany({
      data: formattedOrders
    });

    return NextResponse.json({ 
      success: true, 
      count: formattedOrders.length,
      message: `تم استيراد ${formattedOrders.length} طلب بنجاح ✅` 
    });

  } catch (error: any) {
    console.error("Import Error:", error);
    return errorResponse("فشل الاستيراد: تأكد من تنسيق الملف", 500);
  }
}