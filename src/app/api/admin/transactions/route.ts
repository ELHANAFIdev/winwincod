import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await getSessionUser();
    if (!admin || admin.role !== "ADMIN") return errorResponse("غير مصرح", 401);

    const [deposits, withdrawals] = await Promise.all([
      prisma.depositrequest.findMany({
        include: { seller: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.withdrawalrequest.findMany({
        include: {
          seller: { select: { name: true, email: true, bankName: true, bankAccountName: true, rib: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const rows = [
      ...deposits.map((d) => ({
        id: d.id,
        type: "DEPOSIT" as const,
        seller: d.seller,
        amount: Number(d.amount),
        status: d.status,
        createdAt: d.createdAt,
        receiptImage: d.receiptImage ?? null,
        bankName: null,
        bankAccountName: null,
        rib: null,
      })),
      ...withdrawals.map((w) => ({
        id: w.id,
        type: "WITHDRAWAL" as const,
        seller: w.seller,
        amount: Number(w.amount),
        status: w.status,
        createdAt: w.createdAt,
        receiptImage: w.receiptImage ?? null,
        bankName: w.seller.bankName ?? null,
        bankAccountName: w.seller.bankAccountName ?? null,
        rib: w.seller.rib ?? null,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, rows });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
