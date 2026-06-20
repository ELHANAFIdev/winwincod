import { NextResponse } from "next/server";
import { getCities } from "@/lib/moroccan-cities";

export const dynamic = "force-dynamic";

export async function GET() {
  const cities = await getCities();
  return NextResponse.json({ cities });
}
