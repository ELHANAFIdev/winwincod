import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

// ─── Parse search query ───────────────────────────────────────────────────────

function parseQuery(q: string): { seqId?: number; phone?: string; id?: string } {
  const trimmed = q.trim();

  // ORD-XXXX format
  const ordMatch = trimmed.match(/^ORD[-\s]?(\d+)$/i);
  if (ordMatch) return { seqId: parseInt(ordMatch[1], 10) };

  // Phone: starts with 0 or +212 and is numeric-ish
  if (/^(\+212|00212|0)[0-9\s\-]{8,12}$/.test(trimmed)) {
    const digits = trimmed.replace(/[\s\-]/g, "");
    return { phone: digits };
  }

  // Pure number → treat as seqId
  if (/^\d{1,6}$/.test(trimmed)) return { seqId: parseInt(trimmed, 10) };

  // UUID-like
  if (/^[0-9a-f\-]{30,}$/i.test(trimmed)) return { id: trimmed };

  return {};
}

// ─── GET /api/seller/tracking?q=... ──────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER") return errorResponse("غير مصرح", 401);

    const q = req.nextUrl.searchParams.get("q")?.trim();
    if (!q) return errorResponse("أدخل رقم الطلب أو رقم الهاتف", 400);

    const parsed = parseQuery(q);

    // Build Prisma where clause — always scoped to this seller
    let where: any = { sellerId: user.id };

    if (parsed.seqId !== undefined) {
      where.seqId = parsed.seqId;
    } else if (parsed.phone) {
      where.customerPhone = { contains: parsed.phone.replace(/^(\+212|00212)/, "0") };
    } else if (parsed.id) {
      where.id = parsed.id;
    } else {
      return errorResponse("صيغة البحث غير صحيحة", 400);
    }

    const order = await prisma.order.findFirst({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        statusHistory: {
          orderBy: { createdAt: "asc" },
          select: { status: true, createdAt: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ order: null }, { status: 200 });
    }

    const ref = order.seqId
      ? `ORD-${String(order.seqId).padStart(4, "0")}`
      : `ORD-${order.id.slice(0, 4).toUpperCase()}`;

    return NextResponse.json({
      order: {
        id:            order.id,
        ref,
        seqId:         order.seqId,
        customerName:  order.customerName,
        customerPhone: order.customerPhone,
        productName:   order.productName,
        quantity:      order.quantity,
        codAmount:     Number(order.codAmount),
        city:          order.city,
        address:       order.address,
        status:        order.status,
        trackingNumber: order.trackingNumber,
        createdAt:     order.createdAt.toISOString(),
        updatedAt:     order.updatedAt.toISOString(),
        statusHistory: order.statusHistory.map((h) => ({
          status:    h.status,
          createdAt: h.createdAt.toISOString(),
        })),
      },
    });
  } catch (err) {
    console.error("[tracking]", err);
    return errorResponse("خطأ في الخادم", 500);
  }
}
