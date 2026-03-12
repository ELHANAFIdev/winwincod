import { NextResponse } from "next/server";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { creditWallet } from "@/services/walletService";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    
    // التحقق أن القائم بالعملية هو ADMIN فقط
    if (!user || user.role !== "ADMIN") {
      return errorResponse("صلاحية مدير فقط مطلوبة", 401);
    }

    const { targetUserId, amount, note } = await req.json();

    if (!targetUserId || !amount || amount <= 0) {
      return errorResponse("بيانات غير مكتملة أو مبلغ غير صالح", 400);
    }

    // استخدام الخدمة التي كتبناها سابقاً لشحن المحفظة
    await creditWallet(
        targetUserId, 
        Number(amount), 
        "DEPOSIT", // نوع العملية: إيداع
        "ADMIN_TOPUP", 
        note || "شحن رصيد من قبل الإدارة"
    );

    return NextResponse.json({ success: true, message: "تم شحن الرصيد بنجاح" });

  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}