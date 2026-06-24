import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Not logged in or not a seller → let the dashboard layout handle auth
  if (!token || token.role !== "SELLER") return NextResponse.next();

  const isOnboarding = pathname === "/seller/onboarding";
  const onboarded    = token.hasCompletedOnboarding as boolean | undefined;

  // Seller hasn't completed onboarding → redirect to onboarding wizard
  if (!onboarded && !isOnboarding) {
    return NextResponse.redirect(new URL("/seller/onboarding", req.url));
  }

  // Seller has already completed onboarding → don't re-show the wizard
  if (onboarded && isOnboarding) {
    return NextResponse.redirect(new URL("/seller/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Only run on seller routes; skip API, static assets, NextAuth internals
  matcher: ["/seller/:path*"],
};
