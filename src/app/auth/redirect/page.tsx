"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function AuthRedirectPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      window.location.href = "/login";
      return;
    }
    if (session.user?.role === "ADMIN") {
      window.location.href = "/admin/dashboard";
    } else if (session.user?.role === "CALL_CENTER") {
      window.location.href = "/call-center/dashboard";
    } else {
      window.location.href = "/seller/dashboard";
    }
  }, [session, status]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-gray-500 text-sm">جاري التحويل...</p>
    </div>
  );
}
