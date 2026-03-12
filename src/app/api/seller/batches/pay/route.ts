import { NextResponse } from "next/server";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { payBatchFromWallet } from "@/services/orderService";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    
    // 1. التحقق من هوية المستخدم
    if (!user || user.role !== "SELLER") {
      return errorResponse("غير مصرح لك بالقيام بهذه العملية", 401);
    }

    // 2. الحصول على رقم الدفعة من الطلب
    const { batchId } = await req.json();
    if (!batchId) {
      return errorResponse("رقم الدفعة مطلوب", 400);
    }

    // 3. استدعاء الخدمة المالية (التي تخصم من المحفظة وتحدث حالة الطلبات)
    await payBatchFromWallet(user.id, batchId);

    return NextResponse.json({ 
      success: true, 
      message: "تم الدفع بنجاح وتحديث حالة الطلبات" 
    });

  } catch (error: any) {
    console.error("Payment API Error:", error.message);
    return errorResponse(error.message || "حدث خطأ أثناء عملية الدفع", 500);
  }
}