"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  BarChart3, Package, Truck, RefreshCw, Wallet, ArrowDownCircle,
  Receipt, Box, Building2, UserPlus, Users, LogOut,
  ChevronsLeft, ChevronsRight, Zap, CalendarDays,
} from "lucide-react";
import type { ReactNode } from "react";

export interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

// ─── Nav item ─────────────────────────────────────────────────────────────────

function NavItem({
  href, icon, label, active, collapsed, badge,
}: {
  href: string; icon: ReactNode; label: string;
  active: boolean; collapsed: boolean; badge?: number;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
        ${active ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}
        ${collapsed ? "justify-center px-0" : ""}
      `}
    >
      {active && <span className="absolute right-0 top-1 bottom-1 w-[3px] bg-blue-600 rounded-full" />}
      <span className={`w-5 h-5 flex-shrink-0 flex justify-center ${active ? "text-blue-500" : "text-slate-400"}`}>
        {icon}
      </span>
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && badge && badge > 0 ? (
        <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center leading-none">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
      {collapsed && badge && badge > 0 ? (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      ) : null}
    </Link>
  );
}

function Section({ label, children, collapsed }: { label: string; children: ReactNode; collapsed: boolean }) {
  return (
    <div className="mt-5 space-y-0.5">
      {!collapsed && <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium px-3 mb-2">{label}</p>}
      {collapsed && <div className="border-t border-slate-100 mx-2 my-3" />}
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/users/requests?status=PENDING")
      .then((r) => r.json())
      .then((d) => {
        const n = d.total ?? d.count ?? (Array.isArray(d.requests) ? d.requests.length : 0);
        setPendingCount(Number(n) || 0);
      })
      .catch(() => {});
  }, []);

  const name    = (session?.user as any)?.name ?? "مدير";
  const initial = name.charAt(0).toUpperCase();

  return (
    <aside
      className={`
        flex flex-col bg-white border-l border-slate-200 flex-shrink-0
        /* Mobile: fixed overlay */
        fixed right-0 top-0 h-screen z-40 w-[260px]
        ${mobileOpen ? "translate-x-0" : "translate-x-full"}
        /* Desktop: sticky flex child */
        md:sticky md:top-0 md:h-screen md:translate-x-0 md:z-auto
        ${collapsed ? "md:w-[72px]" : "md:w-[260px]"}
        transition-all duration-300
      `}
    >
      {/* Header */}
      <div className={`h-16 flex items-center border-b border-slate-100 flex-shrink-0 gap-3 ${collapsed ? "justify-center px-3" : "justify-between px-4"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <div className="leading-none select-none">
              <span className="text-[16px] font-black text-slate-800">WinWin</span>
              <span className="text-[16px] font-black text-orange-500">COD</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
        )}
        <button
          onClick={onToggle}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition flex-shrink-0"
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pt-2 pb-4">
        <Section label="الرئيسية" collapsed={collapsed}>
          <NavItem href="/admin/dashboard"  icon={<BarChart3 className="w-5 h-5" />}     label="الإحصائيات" active={pathname === "/admin/dashboard"} collapsed={collapsed} />
          <NavItem href="/admin/calendar"   icon={<CalendarDays className="w-5 h-5" />}  label="التقويم"    active={pathname === "/admin/calendar"}    collapsed={collapsed} />
        </Section>

        <Section label="العمليات" collapsed={collapsed}>
          <NavItem href="/admin/orders"           icon={<Package className="w-5 h-5" />}         label="إدارة الطلبات"    active={pathname.startsWith("/admin/orders")}        collapsed={collapsed} />
          <NavItem href="/admin/logistics"        icon={<Truck className="w-5 h-5" />}           label="شحن الطلبيات"    active={pathname === "/admin/logistics"}             collapsed={collapsed} />
          <NavItem href="/admin/logistics/update" icon={<RefreshCw className="w-5 h-5" />}       label="تحديث التوصيل"   active={pathname === "/admin/logistics/update"}      collapsed={collapsed} />
        </Section>

        <Section label="المالية" collapsed={collapsed}>
          <NavItem href="/admin/deposits"     icon={<Wallet className="w-5 h-5" />}          label="إدارة المحافظ"     active={pathname === "/admin/deposits"}    collapsed={collapsed} />
          <NavItem href="/admin/withdrawals"  icon={<ArrowDownCircle className="w-5 h-5" />} label="سحوبات الأرباح"    active={pathname === "/admin/withdrawals"} collapsed={collapsed} />
          <NavItem href="/admin/transactions" icon={<Receipt className="w-5 h-5" />}         label="المعاملات المالية" active={pathname === "/admin/transactions"} collapsed={collapsed} />
        </Section>

        <Section label="المخزون" collapsed={collapsed}>
          <NavItem href="/admin/products"  icon={<Box className="w-5 h-5" />}       label="المنتجات" active={pathname === "/admin/products"}  collapsed={collapsed} />
          <NavItem href="/admin/suppliers" icon={<Building2 className="w-5 h-5" />} label="الموردين" active={pathname === "/admin/suppliers"} collapsed={collapsed} />
        </Section>

        <Section label="المستخدمين" collapsed={collapsed}>
          <NavItem href="/admin/users/requests" icon={<UserPlus className="w-5 h-5" />} label="طلبات الانضمام"  active={pathname === "/admin/users/requests"} collapsed={collapsed} badge={pendingCount} />
          <NavItem href="/admin/users"          icon={<Users className="w-5 h-5" />}    label="كل المستخدمين"  active={pathname === "/admin/users"}          collapsed={collapsed} />
        </Section>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-3 flex-shrink-0 space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
              <p className="text-[11px] text-slate-400">مدير النظام</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center py-1">
            <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">{initial}</div>
          </div>
        )}
        <button
          onClick={() => signOut()}
          title={collapsed ? "تسجيل الخروج" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition text-sm font-medium ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
}
