import { NextResponse } from "next/server";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { markAllAsRead } from "@/services/notificationService";

export async function POST() {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("غير مصرح", 401);

    await markAllAsRead(user.id);

    return NextResponse.json({ success: true });
  } catch {
    return errorResponse("فشل تحديد الكل كمقروء", 500);
  }
}
