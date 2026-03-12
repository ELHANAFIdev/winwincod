import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") return errorResponse("غير مصرح", 401);

    // جلب الدفعات التي تحتوي على طلبات PROCESSING
    // قمت بإزالة شرط isPaid مؤقتاً للتأكد من ظهور البيانات، ثم سنعيده
    const batches = await prisma.orderbatch.findMany({
      where: {
        orders: {
          some: { status: 'PROCESSING' }
        }
      },
      include: {
        seller: { select: { name: true, phone: true } },
        orders: {
          where: { status: 'PROCESSING' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log("DEBUG: Batches found for logistics:", batches.length);

    return NextResponse.json({ success: true, batches });
  } catch (error: any) {
    console.error("Logistics API Error:", error);
    return errorResponse("فشل جلب الشحنات: " + error.message, 500);
  }
}