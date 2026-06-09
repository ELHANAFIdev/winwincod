import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Returns why a login might fail — used by the login page to show the right message.
// Does NOT expose passwords or any sensitive data.
export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get("email");
  if (!email) return NextResponse.json({ status: "invalid" });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { isActive: true, password: true },
  });

  if (!user) return NextResponse.json({ status: "not_found" });
  if (!user.isActive) return NextResponse.json({ status: "pending" });
  if (!user.password) return NextResponse.json({ status: "google_account" });
  return NextResponse.json({ status: "active" });
}
