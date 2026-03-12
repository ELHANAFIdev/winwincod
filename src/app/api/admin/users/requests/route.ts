import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return errorResponse("غير مصرح", 401);

  const users = await prisma.user.findMany({
    where: { 
      role: 'SELLER', 
      isActive: false // نجلب فقط غير المفعلين
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ users });
}