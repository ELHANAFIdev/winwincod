import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";
import { z } from "zod";

const SHIPPING_COST_PER_ORDER = 30;

const schema = z.object({
  orderIds: z.array(z.string()).min(1, "يجب اختيار طلب واحد على الأقل"),
});

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER") return errorResponse("غير مصرح", 401);

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message ?? "بيانات غير صالحة", 400);

    const { orderIds } = parsed.data;

    // Verify all orders belong to this seller and are DRAFT
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds }, sellerId: user.id, status: "DRAFT" },
      select: { id: true },
    });

    if (orders.length !== orderIds.length) {
      return errorResponse("بعض الطلبات غير موجودة أو ليست مسودات", 400);
    }

    const totalCost = orders.length * SHIPPING_COST_PER_ORDER;

    // Check wallet balance
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) return errorResponse("المحفظة غير موجودة، تواصل مع الإدارة", 400);
    if (Number(wallet.balance) < totalCost) {
      return errorResponse(
        `رصيد غير كافٍ. رصيدك: ${Number(wallet.balance).toFixed(2)} د.م — المطلوب: ${totalCost} د.م`,
        400
      );
    }

    // Deduct wallet and update orders in one transaction
    await prisma.$transaction(async (tx) => {
      // Deduct shipping cost from wallet
      const updatedWallet = await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: totalCost } },
      });

      await tx.transaction.create({
        data: {
          walletId: updatedWallet.id,
          amount: -totalCost,
          type: "SHIPPING_PAYMENT",
          referenceId: orderIds.join(","),
          description: `رسوم شحن ${orders.length} طلب`,
        },
      });

      // Update orders status to PROCESSING and set shippingFee
      await tx.order.updateMany({
        where: { id: { in: orderIds } },
        data: {
          status: "PROCESSING",
          shippingFee: SHIPPING_COST_PER_ORDER,
          updatedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      success: true,
      orderCount: orders.length,
      totalCost,
      message: `تم إرسال ${orders.length} طلب للشحن بنجاح — تم خصم ${totalCost} د.م من محفظتك`,
    });
  } catch (error: any) {
    console.error("[ship-all]", error);
    return errorResponse(error.message, 500);
  }
}
