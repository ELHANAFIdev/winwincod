import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return errorResponse("غير مصرح", 401);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // PENDING | APPROVED | REJECTED | null (all)

  const where = status ? { status: status as any } : {};

  const requests = await prisma.depositrequest.findMany({
    where,
    include: {
      seller: { select: { name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Summary counts for tabs
  const [pending, approved, rejected] = await Promise.all([
    prisma.depositrequest.count({ where: { status: "PENDING" } }),
    prisma.depositrequest.count({ where: { status: "APPROVED" } }),
    prisma.depositrequest.count({ where: { status: "REJECTED" } }),
  ]);

  return NextResponse.json({
    success: true,
    requests,
    counts: { pending, approved, rejected, total: pending + approved + rejected },
  });
}
