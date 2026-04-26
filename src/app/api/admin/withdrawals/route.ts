import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await getSessionUser();
    if (!admin || admin.role !== "ADMIN") return errorResponse("غير مصرح", 401);

    const withdrawals = await prisma.withdrawalrequest.findMany({
      where: { status: "PENDING" },
      include: {
        seller: {
          select: { name: true, email: true, bankName: true, bankAccountName: true, rib: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, requests: withdrawals });
  } catch (error) {
    return errorResponse("فشل جلب الطلبات", 500);
  }
}
