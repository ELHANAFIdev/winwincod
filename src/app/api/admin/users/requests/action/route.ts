import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") return errorResponse("غير مصرح", 401);

    const { userId, action } = await req.json();

    if (action === 'REJECT') {
      // الرفض = حذف المستخدم نهائياً لتنظيف القاعدة
      await prisma.user.delete({ where: { id: userId } });
      return NextResponse.json({ success: true, message: "تم رفض وحذف الطلب" });
    }

    if (action === 'APPROVE') {
      // الموافقة = تفعيل الحساب + إنشاء المحفظة
      await prisma.$transaction(async (tx) => {
        // 1. تفعيل الحساب
        await tx.user.update({
          where: { id: userId },
          data: { isActive: true }
        });

        // 2. التأكد من عدم وجود محفظة مسبقاً ثم إنشائها
        const existingWallet = await tx.wallet.findUnique({ where: { userId } });
        if (!existingWallet) {
          await tx.wallet.create({
            data: { userId, balance: 0 }
          });
        }
      });

      return NextResponse.json({ success: true, message: "تم تفعيل الحساب بنجاح" });
    }

  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}