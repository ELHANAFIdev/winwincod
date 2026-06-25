"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { LayoutDashboard, Phone, Users, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Toaster } from "react-hot-toast";
import TopNavbar from "@/components/layout/TopNavbar";
import MobileNav from "@/components/layout/MobileNav";
import type { ReactNode } from "react";

// ─── Sidebar nav item ─────────────────────────────────────────────────────────

function SidebarItem({
  href, icon, label, active, collapsed,
}: {
  href: string; icon: ReactNode; label: string; active: boolean; collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium
        ${active ? "bg-white/15 text-white" : "text-blue-200 hover:bg-white/10 hover:text-white"}
        ${collapsed ? "justify-center px-0" : ""}
      `}
    >
      <span className="w-5 h-5 flex-shrink-0 flex justify-center">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

function SidebarSection({ label, children, collapsed }: { label: string; children: ReactNode; collapsed: boolean }) {
  return (
    <div className="space-y-0.5">
      {!collapsed && (
        <p className="text-blue-300 text-[11px] font-bold uppercase tracking-wider px-3 pt-5 pb-1.5">
          {label}
        </p>
      )}
      {collapsed && <div className="border-t border-white/10 my-3 mx-2" />}
      {children}
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function CallCenterLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const sidebarW = collapsed ? "md:w-[70px]" : "md:w-[260px]";
  const mainMr   = collapsed ? "md:mr-[70px]" : "md:mr-[260px]";

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] font-sans" dir="rtl">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed h-full z-40 bg-[#3254D4] flex flex-col shadow-xl shadow-blue-900/30 transition-all duration-300
          ${sidebarW}
          ${mobileOpen ? "translate-x-0 w-[260px]" : "translate-x-full w-[260px]"}
          md:translate-x-0
        `}
      >
        {/* Logo + collapse */}
        <div className={`flex items-center border-b border-white/10 flex-shrink-0 ${collapsed ? "justify-center p-4" : "justify-between px-5 py-4"}`}>
          {!collapsed && (
            <div>
              <img src="/logo-white.svg" alt="WinWin COD" className="h-8 w-auto" />
              <p className="text-[10px] text-white/50 font-medium mt-1">كول سنتر</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden md:flex text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-lg transition flex-shrink-0"
          >
            {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0">
          <SidebarSection label="الرئيسية" collapsed={collapsed}>
            <SidebarItem
              href="/call-center/dashboard"
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="لوحة التحكم"
              active={pathname === "/call-center/dashboard"}
              collapsed={collapsed}
            />
          </SidebarSection>

          <SidebarSection label="العمليات" collapsed={collapsed}>
            <SidebarItem
              href="/call-center/dashboard"
              icon={<Phone className="w-5 h-5" />}
              label="الطلبات"
              active={pathname.startsWith("/call-center/dashboard") && pathname !== "/call-center/dashboard"}
              collapsed={collapsed}
            />
            <SidebarItem
              href="/call-center/sellers"
              icon={<Users className="w-5 h-5" />}
              label="البائعون"
              active={pathname.startsWith("/call-center/sellers")}
              collapsed={collapsed}
            />
          </SidebarSection>
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-white/10 flex-shrink-0">
          <button
            onClick={() => signOut()}
            title={collapsed ? "تسجيل الخروج" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-orange-400 hover:bg-white/10 transition font-medium text-sm ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${mainMr}`}>
        <TopNavbar onMenuToggle={() => setMobileOpen((v) => !v)} role="call-center" />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>

      <MobileNav role="call-center" />
    </div>
  );
}
