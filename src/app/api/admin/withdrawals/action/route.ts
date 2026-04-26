import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { z } from "zod";
import { chargeWallet } from "@/services/walletService";

const actionSchema = z.object({
  id: z.string(),
  action: z.enum(["APPROVE", "REJECT"]),
  receiptUrl: z.string().url("رابط الوصل غير صحيح").optional().or(z.literal(""))
});

export async function POST(req: Request) {
  try {
    const admin = await getSessionUser();
    if (!admin || admin.role !== "ADMIN") return errorResponse("غير مصرح", 401);

    const body = await req.json();
    const validation = actionSchema.safeParse(body);
    if (!validation.success) return errorResponse("بيانات غير صالحة", 400);

    const { id, receiptUrl, action } = validation.data;
    const isApprove = action === "APPROVE";

    const request = await prisma.withdrawalrequest.findUnique({ where: { id }});
    if (!request || request.status !== "PENDING") {
      return errorResponse("الطلب غير موجود أو تمت معالجته مسبقا", 404);
    }

    if (isApprove) {
      if (!receiptUrl) return errorResponse("يجب إرفاق صورة الوصل البنكي", 400);

      // تمت الموافقة: تحديث الحالة وخصم المبلغ من المحفظة
      try {
        await chargeWallet(request.sellerId, Number(request.amount), 'WITHDRAWAL', request.id);
      } catch (err: any) {
        return errorResponse("فشل خصم الرصيد: " + err.message, 400);
      }

      await prisma.withdrawalrequest.update({
        where: { id },
        data: { status: "APPROVED", receiptImage: receiptUrl }
      });
    } else {
      // الرفض: مجرد تحديث الحالة لأن الخصم لم يحدث أساساً
      await prisma.withdrawalrequest.update({
        where: { id },
        data: { status: "REJECTED" }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("ADMIN_WITHDRAWAL_ACTION:", err);
    return errorResponse(err.message, 500);
  }
}
