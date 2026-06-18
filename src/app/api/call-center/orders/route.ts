import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "CALL_CENTER" && user.role !== "ADMIN")) {
      return errorResponse("غير مصرح لك بالوصول لهذه البيانات", 401);
    }

    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");

    const where = sellerId
      ? { status: "PENDING_CONFIRMATION" as const, sellerId }
      : { status: "PENDING_CONFIRMATION" as const };

    const orders = await prisma.order.findMany({
      where,
      include: {
        seller: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const seller = sellerId && orders.length > 0 ? orders[0].seller : null;

    return NextResponse.json({ success: true, orders, seller });
  } catch (error: any) {
    return errorResponse("فشل جلب الطلبات: " + error.message, 500);
  }
}
