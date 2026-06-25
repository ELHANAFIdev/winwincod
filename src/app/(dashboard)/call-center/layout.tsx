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
    <div className="flex flex-row-reverse min-h-screen">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar — RIGHT */}
      <CallCenterSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main area — LEFT */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopNavbar onMenuToggle={() => setMobileOpen((v) => !v)} role="call-center" />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      <MobileNav role="call-center" />
    </div>
  );
}
