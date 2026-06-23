import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER") return errorResponse("غير مصرح", 401);

    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });

    return NextResponse.json({
      success: true,
      balance: Number(wallet?.balance ?? 0),
    });
  } catch {
    return errorResponse("فشل جلب الرصيد", 500);
  }
}
