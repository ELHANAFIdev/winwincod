import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    DATABASE_URL_SET: !!process.env.DATABASE_URL,
    DATABASE_URL_PREFIX: process.env.DATABASE_URL?.slice(0, 40),
    DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length,
    DIRECT_URL_SET: !!process.env.DIRECT_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
}
