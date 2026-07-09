// src/proxy.ts — Next.js 16 route-guard convention (formerly "middleware.ts")
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role;

    // 1. حماية لوحة المدير العام (ADMIN ONLY)
    if (path.startsWith("/admin")) {
      if (role !== "ADMIN") {
        // إذا كان كول سنتر وحاول الدخول للآدمن، نعيده لمكانه
        if (role === "CALL_CENTER") {
            return NextResponse.redirect(new URL("/call-center/dashboard", req.url));
        }
        return NextResponse.redirect(new URL("/seller/dashboard", req.url));
      }
    }

    // 2. حماية لوحة الكول سنتر (CALL_CENTER & ADMIN)
    if (path.startsWith("/call-center")) {
      // نسمح للمدير بالدخول للمراقبة، وبالتأكيد لموظف الكول سنتر
      if (role !== "CALL_CENTER" && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/seller/dashboard", req.url));
      }
    }

    // 3. حماية لوحة البائع (SELLER ONLY)
    if (path.startsWith("/seller")) {
      if (role !== "SELLER") {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      // Defense-in-depth: today a pending seller (isActive: false) can never reach this
      // point at all — authorize() throws and the Google signIn() callback redirects
      // before NextAuth ever issues a token for them. This check is a safety net in case
      // that upstream gating is ever changed or bypassed, so route access doesn't silently
      // rely on a single point of enforcement.
      if (token?.isActive === false) {
        return NextResponse.redirect(new URL("/login?error=PendingApproval", req.url));
      }

      // Onboarding guard — sellers must complete the wizard before accessing any seller page
      const isOnboarding = path === "/seller/onboarding";
      const onboarded = token?.hasCompletedOnboarding as boolean | undefined;

      if (!onboarded && !isOnboarding) {
        return NextResponse.redirect(new URL("/seller/onboarding", req.url));
      }

      // Block re-entry into the wizard once onboarding is done
      if (onboarded && isOnboarding) {
        return NextResponse.redirect(new URL("/seller/dashboard", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // نضيف المسار الجديد للمراقبة
  matcher: ["/admin/:path*", "/seller/:path*", "/call-center/:path*"],
};
