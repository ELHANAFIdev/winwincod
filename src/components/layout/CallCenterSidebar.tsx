"use client";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LayoutDashboard, Phone, Users, LogOut, ChevronsLeft, ChevronsRight, Zap } from "lucide-react";
import type { ReactNode } from "react";

export interface CallCenterSidebarProps {
  collapsed: boolean;
  onCollapsedChange: (v: boolean) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (v: boolean) => void;
}

function NavItem({
  href, icon, label, active, collapsed,
}: {
  href: string; icon: ReactNode; label: string; active: boolean; collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all overflow-hidden
        ${active
          ? "bg-blue-50 text-blue-600 font-semibold"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}
        ${collapsed ? "justify-center px-0" : ""}
      `}
    >
      {active && <span className="absolute right-0 top-1 bottom-1 w-[3px] bg-blue-600 rounded-full" />}
      <span className={`w-5 h-5 flex-shrink-0 flex justify-center ${active ? "text-blue-500" : "text-slate-400"}`}>
        {icon}
      </span>
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
    </Link>
  );
}

function Section({ label, children, collapsed }: { label: string; children: ReactNode; collapsed: boolean }) {
  return (
    <div className="space-y-0.5 mt-5">
      {!collapsed && (
        <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium px-3 mb-2">{label}</p>
      )}
      {collapsed && <div className="border-t border-slate-100 my-3 mx-2" />}
      {children}
    </div>
  );
}

export default function CallCenterSidebar({
  collapsed, onCollapsedChange, mobileOpen, onMobileOpenChange,
}: CallCenterSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName    = (session?.user as any)?.name ?? "كول سنتر";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <aside
      className={`
        fixed top-0 right-0 h-screen z-40 bg-white border-l border-slate-200
        flex flex-col shadow-sm transition-all duration-300
        w-[260px] ${collapsed ? "md:w-[72px]" : "md:w-[260px]"}
        ${mobileOpen ? "translate-x-0" : "translate-x-full"} md:translate-x-0
      `}
    >
      {/* ── Header ── */}
      <div className={`h-16 flex items-center border-b border-slate-100 flex-shrink-0 ${collapsed ? "justify-center px-3" : "justify-between px-4"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
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
          onClick={() => onCollapsedChange(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition flex-shrink-0"
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-2 pt-2 pb-4">
        <Section label="الرئيسية" collapsed={collapsed}>
          <NavItem href="/call-center/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="لوحة التحكم"
            active={pathname === "/call-center/dashboard"} collapsed={collapsed} />
        </Section>

        <Section label="العمليات" collapsed={collapsed}>
          <NavItem
            href="/call-center/orders"
            icon={<Phone className="w-5 h-5" />}
            label="الطلبات"
            active={pathname.startsWith("/call-center/orders")}
            collapsed={collapsed}
          />
          <NavItem
            href="/call-center/sellers"
            icon={<Users className="w-5 h-5" />}
            label="البائعون"
            active={pathname.startsWith("/call-center/sellers")}
            collapsed={collapsed}
          />
        </Section>
      </nav>

      {/* ── Footer ── */}
      <div className="border-t border-slate-100 p-3 flex-shrink-0 space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
              <p className="text-[11px] text-slate-400">كول سنتر</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center py-1">
            <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
              {userInitial}
            </div>
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
