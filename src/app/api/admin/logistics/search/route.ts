import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") return errorResponse("غير مصرح", 401);

    const { query } = await req.json();

    // البحث عن الطلبات التي خرجت للشحن فقط (SHIPPED)
    const orders = await prisma.order.findMany({
      where: {
        status: 'SHIPPED', // 👈 نبحث فقط في المشحون
        OR: [
          { customerPhone: { contains: query } },
          { customerName: { contains: query } }
        ]
      },
      include: {
        seller: { select: { name: true } } // لنعرف من البائع
      },
      take: 20, // جلب آخر 20 نتيجة
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}