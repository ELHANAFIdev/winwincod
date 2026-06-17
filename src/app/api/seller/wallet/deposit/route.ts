import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // تأكد من وجود @ أو المسار الصحيح
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { z } from "zod";

const depositSchema = z.object({
  amount: z.coerce.number().positive(),
  receiptImage: z.string().url("رابط الوصل غير صالح"),
});

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("غير مصرح", 401);

    const body = await req.json();
    const validation = depositSchema.safeParse(body);

    if (!validation.success) return errorResponse(validation.error.errors[0].message, 400);

    await prisma.depositrequest.create({
      data: {
        sellerId: user.id,
        amount: validation.data.amount,
        receiptImage: validation.data.receiptImage,
        status: "PENDING",
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Deposit error:", error);
    return errorResponse(error.message, 500);
  }
}