import { NextResponse } from "next/server";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { createBatch } from "@/services/orderService"; // الدالة التي كتبناها في الخطوة 4

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER") return errorResponse("غير مصرح", 401);

    const { orderIds } = await req.json();

    if (!Array.isArray(orderIds) || orderIds.length < 5) {
      return errorResponse("يجب اختيار 5 طلبات على الأقل", 400);
    }

    // استدعاء الخدمة (Business Logic)
    const batch = await createBatch(user.id, orderIds);

    return NextResponse.json({ success: true, batchId: batch.id });

  } catch (error: any) {
    return errorResponse(error.message || "فشل إنشاء الدفعة", 500);
  }
}