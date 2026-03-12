import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { z } from "zod";

// مخطط التحقق
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
    
    // 1. التحقق من صحة البيانات أولاً
    const validation = createOrderSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("بيانات غير مكتملة أو غير صحيحة", 400);
    }

    // 2. 👈 استخراج "data" بعد نجاح التحقق مباشرة
    const { data } = validation;

    // 3. 👈 الآن نستخدم data.productId للتحقق من المخزون في قاعدة البيانات
    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    });

    if (!product || product.stock < data.quantity) {
      return errorResponse(`عذراً، الكمية المتوفرة في المخزن (${product?.stock || 0}) غير كافية`, 400);
    }

    // 4. إذا كان كل شيء سليماً، نقوم بإنشاء الطلب
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
      }
    });
    
    return NextResponse.json({ success: true, orderId: newOrder.id });

  } catch (error: any) {
    console.error("Server Error:", error);
    return errorResponse("حدث خطأ في الخادم أثناء معالجة الطلب", 500);
  }
}