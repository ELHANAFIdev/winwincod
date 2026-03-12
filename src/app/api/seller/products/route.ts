import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER") return errorResponse("غير مصرح", 401);

    // جلب المنتجات مع إخفاء سعر التكلفة الأصلي (CostPrice) عن البائع
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    sku: true,
    sellerPrice: true,
    marketPrice: true,
    stock: true,
    images: true, 
    description: true
  },
  orderBy: { createdAt: 'desc' }
});


    return NextResponse.json({ success: true, products });
  } catch (error) {
    return errorResponse("فشل جلب المنتجات", 500);
  }
}