import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return errorResponse("غير مصرح", 401);

  const requests = await prisma.depositrequest.findMany({
    where: { status: "PENDING" },
    include: {
      seller: { select: { name: true, email: true, phone: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ success: true, requests });
}