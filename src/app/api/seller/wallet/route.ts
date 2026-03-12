import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER") return errorResponse("غير مصرح", 401);

    // 1. جلب المحفظة الحالية
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
      include: {
        transactions: {
          take: 10, // آخر 10 عمليات فقط
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!wallet) return errorResponse("المحفظة غير موجودة", 404);

    return NextResponse.json({ 
      success: true, 
      balance: wallet.balance,
      transactions: wallet.transactions 
    });

  } catch (error) {
    return errorResponse("فشل جلب بيانات المحفظة", 500);
  }
}