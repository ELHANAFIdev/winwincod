import { NextResponse } from "next/server";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { payBatchFromWallet } from "@/services/orderService";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER") return errorResponse("غير مصرح", 401);

    const { batchId } = await req.json();
    
    // استدعاء الخدمة المالية
    await payBatchFromWallet(user.id, batchId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}