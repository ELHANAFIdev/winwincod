import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") return errorResponse("غير مصرح", 401);

    const { name, contactInfo } = await req.json();

    const newSupplier = await prisma.supplier.create({
      data: { name, contactInfo }
    });

    return NextResponse.json({ success: true, supplier: newSupplier });
  } catch (error) {
    return errorResponse("فشل إضافة المورد", 500);
  }
}

export async function GET() {
    const suppliers = await prisma.supplier.findMany();
    return NextResponse.json({ success: true, suppliers });
}