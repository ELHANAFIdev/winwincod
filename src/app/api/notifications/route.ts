import { NextResponse } from "next/server";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { getNotifications, getUnreadCount } from "@/services/notificationService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("غير مصرح", 401);

    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
    const readParam = searchParams.get("read"); // "true" | "false" | null
    const filterRead =
      readParam === "true"  ? true  :
      readParam === "false" ? false : undefined;

    const [history, unreadCount] = await Promise.all([
      getNotifications(user.id, page, limit, filterRead),
      getUnreadCount(user.id),
    ]);

    return NextResponse.json({
      success: true,
      notifications: history.items,
      unreadCount,
      total: history.total,
      totalPages: history.totalPages,
      page,
    });
  } catch {
    return errorResponse("فشل جلب الإشعارات", 500);
  }
}
