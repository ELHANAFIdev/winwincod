import { NextResponse } from "next/server";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { getWalletHistory, getWalletStats } from "@/services/walletService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER") return errorResponse("غير مصرح", 401);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));

    const [history, stats] = await Promise.all([
      getWalletHistory(user.id, page, limit),
      getWalletStats(user.id),
    ]);

    return NextResponse.json({ success: true, ...history, stats });
  } catch {
    return errorResponse("فشل جلب سجل الحركات", 500);
  }
}
