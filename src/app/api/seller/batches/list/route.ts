import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER") return errorResponse("غير مصرح", 401);

    // جلب كل الدفعات الخاصة بهذا البائع
    const batches = await prisma.orderbatch.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, batches });
  } catch (error) {
    return errorResponse("فشل جلب الدفعات", 500);
  }
}