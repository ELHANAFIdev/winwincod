import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    
    // تأكد من أن المستخدم هو CALL_CENTER أو ADMIN
    if (!user || (user.role !== "CALL_CENTER" && user.role !== "ADMIN")) {
      return errorResponse("غير مصرح لك بالوصول لهذه البيانات", 401);
    }

    // جلب الطلبات التي تنتظر التأكيد فقط
    const orders = await prisma.order.findMany({
      where: {
        status: "PENDING_CONFIRMATION" // 👈 تأكد من تطابق الحالة تماماً
      },
      include: {
        seller: {
          select: { name: true, phone: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ success: true, orders });

  } catch (error: any) {
    console.error("CallCenter API Error:", error);
    return errorResponse("فشل جلب الطلبات: " + error.message, 500);
  }
}