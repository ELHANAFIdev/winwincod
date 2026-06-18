import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "CALL_CENTER" && user.role !== "ADMIN")) {
      return errorResponse("غير مصرح", 401);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [pendingOrders, totalToday, confirmedToday, cancelledToday] = await Promise.all([
      prisma.order.findMany({
        where: { status: "PENDING_CONFIRMATION" },
        select: {
          sellerId: true,
          codAmount: true,
          seller: { select: { id: true, name: true } },
        },
      }),
      prisma.order.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
      prisma.order.count({ where: { status: "CONFIRMED", updatedAt: { gte: todayStart, lte: todayEnd } } }),
      prisma.order.count({ where: { status: "CANCELLED", updatedAt: { gte: todayStart, lte: todayEnd } } }),
    ]);

    const sellerMap = new Map<string, { id: string; name: string; pendingCount: number; totalCOD: number }>();
    for (const order of pendingOrders) {
      const entry = sellerMap.get(order.sellerId);
      if (entry) {
        entry.pendingCount++;
        entry.totalCOD += Number(order.codAmount);
      } else {
        sellerMap.set(order.sellerId, {
          id: order.seller.id,
          name: order.seller.name,
          pendingCount: 1,
          totalCOD: Number(order.codAmount),
        });
      }
    }

    return NextResponse.json({
      success: true,
      sellers: Array.from(sellerMap.values()).sort((a, b) => b.pendingCount - a.pendingCount),
      stats: { totalToday, confirmedToday, cancelledToday, pending: pendingOrders.length },
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
