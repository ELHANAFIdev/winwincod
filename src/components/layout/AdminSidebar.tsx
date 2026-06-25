"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  BarChart3, Package, Truck, RefreshCw, Wallet, ArrowDownCircle,
  Receipt, Box, Building2, UserPlus, Users, LogOut,
  ChevronsLeft, ChevronsRight, Zap, CalendarDays, PlusCircle,
} from "lucide-react";
import type { ReactNode } from "react";

export interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

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
        relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
        ${active
          ? "bg-[#4361EE]/10 text-[#4361EE] font-semibold"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}
        ${collapsed ? "justify-center px-0" : ""}
      `}
    >
      {active && (
        <span className="absolute right-0 top-2 bottom-2 w-[3px] bg-[#4361EE] rounded-full" />
      )}
      <span className={`w-5 h-5 flex-shrink-0 flex justify-center transition-colors ${active ? "text-[#4361EE]" : "text-slate-400"}`}>
        {icon}
      </span>
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && badge && badge > 0 ? (
        <span className="bg-[#EF4444] text-white text-[10px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center leading-none">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
      {collapsed && badge && badge > 0 ? (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-white" />
      ) : null}
    </Link>
  );
}

function Section({ label, children, collapsed }: { label: string; children: ReactNode; collapsed: boolean }) {
  return (
    <div className="mt-6 space-y-0.5">
      {!collapsed && (
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold px-3 mb-2 select-none">
          {label}
        </p>
      )}
      {collapsed && <div className="border-t border-slate-100 mx-3 my-3" />}
      {children}
    </div>
  );
}

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

  const { t } = useLanguage();
  const name    = (session?.user as any)?.name ?? "مدير";
  const initial = name.charAt(0).toUpperCase();

  return (
    <aside
      className={`
        flex flex-col bg-white border-l border-slate-100 flex-shrink-0 shadow-sm
        fixed right-0 top-0 h-screen z-40 w-[260px]
        ${mobileOpen ? "translate-x-0" : "translate-x-full"}
        md:sticky md:top-0 md:h-screen md:translate-x-0 md:z-auto
        ${collapsed ? "md:w-[72px]" : "md:w-[260px]"}
        transition-all duration-300
      `}
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className={`h-16 flex items-center border-b border-slate-100 flex-shrink-0 gap-3 ${collapsed ? "justify-center px-3" : "justify-between px-4"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-[#4361EE] to-[#FB923C] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <Zap className="w-4.5 h-4.5 text-white" fill="white" />
            </div>
            <div className="leading-tight select-none">
              <span className="text-[17px] font-black text-slate-800">WinWin</span>
              <span className="text-[17px] font-black text-[#FB923C]">COD</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 bg-gradient-to-br from-[#4361EE] to-[#FB923C] rounded-xl flex items-center justify-center shadow-sm">
            <Zap className="w-4.5 h-4.5 text-white" fill="white" />
          </div>
        )}
        <button
          onClick={onToggle}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition flex-shrink-0"
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* ── CTA Button ───────────────────────────────────────── */}
      {!collapsed ? (
        <div className="px-3 pt-4 pb-2">
          <Link
            href="/admin/orders"
            className="flex items-center justify-center gap-2 w-full bg-[#4361EE] hover:bg-[#3254D4] text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إدارة الطلبات</span>
          </Link>
        </div>
      ) : (
        <div className="px-2 pt-4 pb-2">
          <Link
            href="/admin/orders"
            title="إدارة الطلبات"
            className="flex items-center justify-center w-full bg-[#4361EE] hover:bg-[#3254D4] text-white py-2.5 rounded-xl transition-all"
          >
            <PlusCircle className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 pt-1 pb-4">
        <Section label={t("section.main")} collapsed={collapsed}>
          <NavItem href="/admin/dashboard" icon={<BarChart3 className="w-5 h-5" />}    label={t("nav.statistics")} active={pathname === "/admin/dashboard"} collapsed={collapsed} />
          <NavItem href="/admin/calendar"  icon={<CalendarDays className="w-5 h-5" />} label={t("nav.calendar")}   active={pathname === "/admin/calendar"}  collapsed={collapsed} />
        </Section>

        <Section label={t("section.operations")} collapsed={collapsed}>
          <NavItem href="/admin/orders"           icon={<Package className="w-5 h-5" />}         label={t("nav.manageOrders")}   active={pathname.startsWith("/admin/orders")}        collapsed={collapsed} />
          <NavItem href="/admin/logistics"        icon={<Truck className="w-5 h-5" />}           label={t("nav.logistics")}      active={pathname === "/admin/logistics"}             collapsed={collapsed} />
          <NavItem href="/admin/logistics/update" icon={<RefreshCw className="w-5 h-5" />}       label={t("nav.deliveryUpdate")} active={pathname === "/admin/logistics/update"}      collapsed={collapsed} />
        </Section>

        <Section label={t("section.finance")} collapsed={collapsed}>
          <NavItem href="/admin/deposits"     icon={<Wallet className="w-5 h-5" />}          label={t("nav.wallets")}      active={pathname === "/admin/deposits"}    collapsed={collapsed} />
          <NavItem href="/admin/withdrawals"  icon={<ArrowDownCircle className="w-5 h-5" />} label={t("nav.withdrawals")}  active={pathname === "/admin/withdrawals"} collapsed={collapsed} />
          <NavItem href="/admin/transactions" icon={<Receipt className="w-5 h-5" />}         label={t("nav.transactions")} active={pathname === "/admin/transactions"} collapsed={collapsed} />
        </Section>

        <Section label={t("section.inventory")} collapsed={collapsed}>
          <NavItem href="/admin/products"  icon={<Box className="w-5 h-5" />}       label={t("nav.products")}  active={pathname === "/admin/products"}  collapsed={collapsed} />
          <NavItem href="/admin/suppliers" icon={<Building2 className="w-5 h-5" />} label={t("nav.suppliers")} active={pathname === "/admin/suppliers"} collapsed={collapsed} />
        </Section>

        <Section label={t("section.users")} collapsed={collapsed}>
          <NavItem href="/admin/users/requests" icon={<UserPlus className="w-5 h-5" />} label={t("nav.joinRequests")} active={pathname === "/admin/users/requests"} collapsed={collapsed} badge={pendingCount} />
          <NavItem href="/admin/users"          icon={<Users className="w-5 h-5" />}    label={t("nav.allUsers")}     active={pathname === "/admin/users"}          collapsed={collapsed} />
        </Section>
      </nav>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div className="border-t border-slate-100 p-3 flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-slate-50 transition cursor-default">
            <div className="w-9 h-9 bg-gradient-to-br from-[#4361EE] to-[#3254D4] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
              <p className="text-[11px] text-slate-400">مدير النظام</p>
            </div>
            <button
              onClick={() => signOut()}
              title="تسجيل الخروج"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-[#4361EE] to-[#3254D4] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
              {initial}
            </div>
            <button
              onClick={() => signOut()}
              title="تسجيل الخروج"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
