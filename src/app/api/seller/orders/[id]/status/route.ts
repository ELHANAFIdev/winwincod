import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

const VALID_STATUSES = [
  "DRAFT", "PENDING_CONFIRMATION", "CONFIRMED", "WAITING_PAYMENT",
  "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED",
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER") return errorResponse("غير مصرح", 401);

    const { id } = await params;
    const { status } = await req.json();

    if (!VALID_STATUSES.includes(status)) return errorResponse("حالة غير صالحة", 400);

    const order = await prisma.order.findFirst({
      where: { id, sellerId: user.id },
      select: { id: true },
    });
    if (!order) return errorResponse("الطلب غير موجود", 404);

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });

    return NextResponse.json({ success: true, status: updated.status });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
