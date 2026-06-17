import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

const VALID_STATUSES = ["PROCESSING", "SHIPPED", "DELIVERED", "RETURNED"] as const;
type Status = typeof VALID_STATUSES[number];

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") return errorResponse("غير مصرح", 401);

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") || "PROCESSING") as Status;

    if (!VALID_STATUSES.includes(status)) return errorResponse("حالة غير صالحة", 400);

    const orders = await prisma.order.findMany({
      where: { status },
      orderBy: { updatedAt: "desc" },
      include: {
        seller: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, sellerPrice: true } },
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
