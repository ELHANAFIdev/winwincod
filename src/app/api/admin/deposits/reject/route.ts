import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") return errorResponse("صلاحية مدير فقط", 401);

    const { id } = await req.json();
    if (!id) return errorResponse("معرف الطلب مطلوب", 400);

    const depositReq = await prisma.depositrequest.findUnique({
      where: { id }
    });

    if (!depositReq || depositReq.status !== "PENDING") {
      return errorResponse("الطلب غير موجود أو تمت معالجته مسبقاً", 400);
    }

    // تحديث حالة الطلب إلى مرفوض (دون تغيير رصيد المحفظة)
    await prisma.depositrequest.update({
      where: { id },
      data: { status: "REJECTED" }
    });

    return NextResponse.json({ success: true, message: "تم رفض الطلب بنجاح" });

  } catch (error: any) {
    console.error("Reject Error:", error.message);
    return errorResponse("حدث خطأ أثناء الرفض", 500);
  }
}