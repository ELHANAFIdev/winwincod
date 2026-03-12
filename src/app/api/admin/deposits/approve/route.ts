import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { creditWallet } from "@/services/walletService";

export async function POST(req: Request) {
  try {
    // 1. التحقق من صلاحيات المدير
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return errorResponse("غير مصرح لك، صلاحية مدير فقط", 401);
    }

    // 2. الحصول على معرف الطلب
    const { id } = await req.json();
    if (!id) return errorResponse("معرف الطلب مطلوب", 400);

    // 3. جلب الطلب من قاعدة البيانات
    // ملاحظة: استخدمنا depositrequest بحروف صغيرة كما في الـ Schema الخاص بك
    const depositReq = await prisma.depositrequest.findUnique({
      where: { id },
      include: { seller: true }
    });

    if (!depositReq) {
      return errorResponse("طلب الشحن غير موجود", 404);
    }

    if (depositReq.status !== "PENDING") {
      return errorResponse("تمت معالجة هذا الطلب مسبقاً", 400);
    }

    // 4. تنفيذ العملية المالية (تحديث الحالة + شحن المحفظة)
    // نستخدم Transaction لضمان الأمان: إما ينجحان معاً أو يفشلان معاً
    await prisma.$transaction(async (tx) => {
      // أ. تحديث حالة الطلب إلى APPROVED
      await tx.depositrequest.update({
        where: { id },
        data: { status: "APPROVED" }
      });

      // ب. زيادة رصيد محفظة البائع
      // سنقوم باستدعاء دالة الشحن (تأكد أن walletService تستخدم الحروف الصغيرة أيضاً)
      const wallet = await tx.wallet.update({
        where: { userId: depositReq.sellerId },
        data: {
          balance: { increment: depositReq.amount }
        }
      });

      // ج. تسجيل العملية في سجل المحفظة (Transactions)
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          amount: depositReq.amount,
          type: "DEPOSIT",
          referenceId: depositReq.id,
          description: `شحن رصيد معتمد - طلب رقم ${depositReq.id.slice(-6)}`
        }
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: "تم شحن رصيد البائع وتحديث الحالة بنجاح ✅" 
    });

  } catch (error: any) {
    console.error("Approval Error:", error.message);
    return errorResponse("حدث خطأ أثناء الموافقة: " + error.message, 500);
  }
}