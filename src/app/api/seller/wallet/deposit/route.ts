import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // تأكد من وجود @ أو المسار الصحيح
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { z } from "zod";

const depositSchema = z.object({
  amount: z.coerce.number().positive(), // أضفنا coerce لضمان تحويل النص لرقم
});

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("غير مصرح", 401);

    const body = await req.json();
    const validation = depositSchema.safeParse(body);

    if (!validation.success) return errorResponse("مبلغ غير صحيح", 400);

    // ملاحظة: تأكد أن الاسم في schema.prisma هو بالضبط depositrequest
    const depositRequest = await prisma.depositrequest.create({
      data: {
        sellerId: user.id,
        amount: validation.data.amount,
        status: "PENDING",
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DEBUG PRISMA:", error);
    return errorResponse(error.message, 500);
  }
}