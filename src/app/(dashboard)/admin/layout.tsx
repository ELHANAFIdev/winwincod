"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  BarChart3, Package, Truck, RefreshCw, Wallet, ArrowDownCircle,
  Receipt, Box, Building2, UserPlus, Users, LogOut, ChevronLeft, ChevronRight,
} from "lucide-react";
import TopNavbar from "@/components/layout/TopNavbar";
import MobileNav from "@/components/layout/MobileNav";
import type { ReactNode } from "react";

// ─── Sidebar nav item ─────────────────────────────────────────────────────────

function SidebarItem({
  href, icon, label, active, collapsed, badge,
}: {
  href: string; icon: ReactNode; label: string;
  active: boolean; collapsed: boolean; badge?: number;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium relative
        ${active ? "bg-white/15 text-white" : "text-blue-200 hover:bg-white/10 hover:text-white"}
        ${collapsed ? "justify-center px-0" : ""}
      `}
    >
      <span className="w-5 h-5 flex-shrink-0 flex justify-center">{icon}</span>
      {!collapsed && <span className="truncate flex-1">{label}</span>}
      {!collapsed && badge && badge > 0 ? (
        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
      {collapsed && badge && badge > 0 ? (
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      ) : null}
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed]         = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [pendingCount, setPendingCount]   = useState(0);

  // Fetch pending join requests count
  useEffect(() => {
    fetch("/api/admin/users/requests?status=PENDING")
      .then((r) => r.json())
      .then((d) => {
        const count = d.total ?? d.count ?? (Array.isArray(d.requests) ? d.requests.length : 0);
        setPendingCount(Number(count) || 0);
      })
      .catch(() => {});
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const sidebarW = collapsed ? "md:w-[70px]" : "md:w-[260px]";
  const mainMr   = collapsed ? "md:mr-[70px]" : "md:mr-[260px]";

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans" dir="rtl">

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
        {/* Logo + collapse button */}
        <div className={`flex items-center border-b border-white/10 flex-shrink-0 ${collapsed ? "justify-center p-4" : "justify-between px-5 py-4"}`}>
          {!collapsed && (
            <div>
              <img src="/logo-white.svg" alt="WinWin COD" className="h-8 w-auto" />
              <p className="text-[10px] text-white/50 font-medium mt-1">لوحة المدير</p>
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
            <SidebarItem href="/admin/dashboard" icon={<BarChart3 className="w-5 h-5" />} label="الإحصائيات"
              active={pathname === "/admin/dashboard"} collapsed={collapsed} />
          </SidebarSection>

          <SidebarSection label="العمليات" collapsed={collapsed}>
            <SidebarItem href="/admin/orders"           icon={<Package className="w-5 h-5" />}         label="إدارة الطلبات"    active={pathname.startsWith("/admin/orders")}        collapsed={collapsed} />
            <SidebarItem href="/admin/logistics"        icon={<Truck className="w-5 h-5" />}           label="شحن الطلبيات"    active={pathname === "/admin/logistics"}             collapsed={collapsed} />
            <SidebarItem href="/admin/logistics/update" icon={<RefreshCw className="w-5 h-5" />}       label="تحديث التوصيل"   active={pathname === "/admin/logistics/update"}      collapsed={collapsed} />
          </SidebarSection>

          <SidebarSection label="المالية" collapsed={collapsed}>
            <SidebarItem href="/admin/deposits"     icon={<Wallet className="w-5 h-5" />}          label="إدارة المحافظ"    active={pathname === "/admin/deposits"}    collapsed={collapsed} />
            <SidebarItem href="/admin/withdrawals"  icon={<ArrowDownCircle className="w-5 h-5" />} label="سحوبات الأرباح"   active={pathname === "/admin/withdrawals"} collapsed={collapsed} />
            <SidebarItem href="/admin/transactions" icon={<Receipt className="w-5 h-5" />}         label="المعاملات المالية" active={pathname === "/admin/transactions"} collapsed={collapsed} />
          </SidebarSection>

          <SidebarSection label="المخزون" collapsed={collapsed}>
            <SidebarItem href="/admin/products"  icon={<Box className="w-5 h-5" />}       label="المنتجات" active={pathname === "/admin/products"}  collapsed={collapsed} />
            <SidebarItem href="/admin/suppliers" icon={<Building2 className="w-5 h-5" />} label="الموردين" active={pathname === "/admin/suppliers"} collapsed={collapsed} />
          </SidebarSection>

          <SidebarSection label="المستخدمين" collapsed={collapsed}>
            <SidebarItem href="/admin/users/requests" icon={<UserPlus className="w-5 h-5" />} label="طلبات الانضمام"  active={pathname === "/admin/users/requests"} collapsed={collapsed} badge={pendingCount} />
            <SidebarItem href="/admin/users"          icon={<Users className="w-5 h-5" />}    label="كل المستخدمين"  active={pathname === "/admin/users"}          collapsed={collapsed} />
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
        <TopNavbar onMenuToggle={() => setMobileOpen((v) => !v)} role="admin" />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">{children}</main>
      </div>

      <MobileNav role="admin" />
    </div>
  );
}
