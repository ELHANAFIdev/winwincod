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

    const pendingOrders = await prisma.order.aggregate({
      where: {
        sellerId: user.id,
        status: { in: ['SHIPPED', 'PROCESSING'] }
      },
      _sum: { netProfit: true }
    });
    const pendingBalance = pendingOrders._sum?.netProfit || 0;

    // حساب الرصيد المتاح فعلياً للسحب بخصم طلبات السحب المعلقة
    const pendingWithdrawalsReqs = await prisma.withdrawalrequest.aggregate({
      where: { sellerId: user.id, status: "PENDING" },
      _sum: { amount: true }
    });
    const pendingWithdrawals = Number(pendingWithdrawalsReqs._sum?.amount || 0);
    const availableBalance = Number(wallet.balance) - pendingWithdrawals;

    const dbUser = await prisma.user.findUnique({ where: { id: user.id }});

    return NextResponse.json({ 
      success: true, 
      balance: availableBalance,
      totalBalance: wallet.balance,
      pendingBalance: pendingBalance,
      pendingWithdrawals: pendingWithdrawals,
      transactions: wallet.transactions,
      bank: {
        bankName: dbUser?.bankName || "",
        bankAccountName: dbUser?.bankAccountName || "",
        rib: dbUser?.rib || ""
      }
    });

  } catch (error) {
    return errorResponse("فشل جلب بيانات المحفظة", 500);
  }
}