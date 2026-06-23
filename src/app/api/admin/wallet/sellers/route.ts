import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return errorResponse("غير مصرح", 401);

  const sellers = await prisma.user.findMany({
    where: { role: "SELLER", isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      wallet: { select: { balance: true, id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = sellers.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    balance: Number(s.wallet?.balance ?? 0),
    walletId: s.wallet?.id ?? null,
  }));

  return NextResponse.json({ success: true, sellers: rows });
}
