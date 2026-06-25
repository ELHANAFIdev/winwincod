"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import CallCenterSidebar from "@/components/layout/CallCenterSidebar";
import TopNavbar from "@/components/layout/TopNavbar";
import MobileNav from "@/components/layout/MobileNav";
import type { ReactNode } from "react";

export default function CallCenterLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <CallCenterSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${collapsed ? "md:mr-[72px]" : "md:mr-[260px]"}`}
      >
        <TopNavbar onMenuToggle={() => setMobileOpen((v) => !v)} role="call-center" />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>

      <MobileNav role="call-center" />
    </div>
  );
}
