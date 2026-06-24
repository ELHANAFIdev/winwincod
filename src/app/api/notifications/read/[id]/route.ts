import { NextResponse } from "next/server";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { markAsRead } from "@/services/notificationService";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("غير مصرح", 401);

    await markAsRead(params.id, user.id);

    return NextResponse.json({ success: true });
  } catch {
    return errorResponse("فشل تحديث الإشعار", 500);
  }
}
