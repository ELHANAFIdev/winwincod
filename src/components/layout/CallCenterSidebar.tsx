"use client";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LayoutDashboard, Phone, Users, LogOut, ChevronsLeft, ChevronsRight, Zap } from "lucide-react";
import type { ReactNode } from "react";

export interface CallCenterSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
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

export default function CallCenterSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: CallCenterSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const name    = (session?.user as any)?.name ?? "كول سنتر";
  const initial = name.charAt(0).toUpperCase();

  return (
    <aside
      className={`
        flex flex-col bg-white border-r border-slate-100 flex-shrink-0 shadow-sm
        fixed left-0 top-0 h-screen z-40 w-[260px]
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
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

      {/* ── Role Badge ───────────────────────────────────────── */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center gap-2 bg-[#4361EE]/8 border border-[#4361EE]/20 rounded-xl px-3 py-2.5">
            <div className="w-7 h-7 bg-[#4361EE] rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#4361EE]">كول سنتر</p>
              <p className="text-[10px] text-slate-400">متصل الآن</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 pt-1 pb-4">
        <Section label="الرئيسية" collapsed={collapsed}>
          <NavItem href="/call-center/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="لوحة التحكم"
            active={pathname === "/call-center/dashboard"} collapsed={collapsed} />
        </Section>

        <Section label="العمليات" collapsed={collapsed}>
          <NavItem href="/call-center/orders"  icon={<Phone className="w-5 h-5" />} label="الطلبات"  active={pathname.startsWith("/call-center/orders")}  collapsed={collapsed} />
          <NavItem href="/call-center/sellers" icon={<Users className="w-5 h-5" />} label="البائعون" active={pathname.startsWith("/call-center/sellers")} collapsed={collapsed} />
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
              <p className="text-[11px] text-slate-400">كول سنتر</p>
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
