import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER") return errorResponse("غير مصرح", 401);

    const body = await req.json();
    const { name, phone, city, storeName, storeDescription } = body as {
      name?: string;
      phone?: string;
      city?: string;
      storeName?: string;
      storeDescription?: string;
    };

    // Basic validation
    if (!name?.trim())      return errorResponse("الاسم الكامل مطلوب", 400);
    if (!phone?.trim())     return errorResponse("رقم الهاتف مطلوب", 400);
    if (!city?.trim())      return errorResponse("المدينة مطلوبة", 400);
    if (!storeName?.trim()) return errorResponse("اسم المتجر مطلوب", 400);

    const phoneClean = phone.trim().replace(/\s/g, "");
    if (!/^(06|07)\d{8}$/.test(phoneClean)) {
      return errorResponse("رقم الهاتف غير صحيح (يجب أن يبدأ بـ 06 أو 07)", 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name:                  name.trim(),
        phone:                 phoneClean,
        city:                  city.trim(),
        storeName:             storeName.trim(),
        storeDescription:      storeDescription?.trim() || null,
        hasCompletedOnboarding: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[onboarding]", err);
    return errorResponse("خطأ في الخادم", 500);
  }
}
