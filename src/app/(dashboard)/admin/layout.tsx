"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";
import TopNavbar from "@/components/layout/TopNavbar";
import MobileNav from "@/components/layout/MobileNav";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <AdminSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      {/* Main content — offset by sidebar width */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${collapsed ? "md:mr-[72px]" : "md:mr-[260px]"}`}
      >
        <TopNavbar onMenuToggle={() => setMobileOpen((v) => !v)} role="admin" />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">{children}</main>
      </div>

      <MobileNav role="admin" />
    </div>
  );
}
