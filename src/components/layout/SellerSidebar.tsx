"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  LayoutDashboard, ShoppingBag, Box, FileSpreadsheet, PlusCircle,
  FileText, Package, MapPin, Wallet, Bell, LogOut,
  ChevronsLeft, ChevronsRight, Zap, CalendarDays,
} from "lucide-react";
import axios from "axios";
import type { ReactNode } from "react";

export interface SellerSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function NavItem({
  href, icon, label, active, collapsed, badge, badgeColor = "bg-[#EF4444]",
}: {
  href: string; icon: ReactNode; label: string;
  active: boolean; collapsed: boolean; badge?: string | number; badgeColor?: string;
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
      {!collapsed && badge !== undefined && badge !== 0 && badge !== "0.00" ? (
        <span className={`${badgeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[20px] text-center`}>
          {badge}
        </span>
      ) : null}
      {collapsed && badge !== undefined && badge !== 0 && badge !== "0.00" ? (
        <span className={`absolute top-1 right-1 w-2.5 h-2.5 ${badgeColor} rounded-full border-2 border-white`} />
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

export default function SellerSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SellerSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [balance, setBalance] = useState("0.00");
  const [unread, setUnread]   = useState(0);

  useEffect(() => {
    axios.get("/api/seller/wallet")
      .then((r) => { if (r.data.balance !== undefined) setBalance(Number(r.data.balance).toFixed(2)); })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    axios.get("/api/notifications?limit=1")
      .then((r) => setUnread(r.data.unreadCount ?? 0))
      .catch(() => {});
  }, [pathname]);

  const { t } = useLanguage();
  const name       = (session?.user as any)?.name ?? "بائع";
  const initial    = name.charAt(0).toUpperCase();
  const balanceNum = Number(balance);

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
            href="/seller/orders/new"
            className="flex items-center justify-center gap-2 w-full bg-[#4361EE] hover:bg-[#3254D4] text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t("sidebar.newOrderBtn")}</span>
          </Link>
        </div>
      ) : (
        <div className="px-2 pt-4 pb-2">
          <Link
            href="/seller/orders/new"
            title={t("sidebar.newOrderBtn")}
            className="flex items-center justify-center w-full bg-[#4361EE] hover:bg-[#3254D4] text-white py-2.5 rounded-xl transition-all"
          >
            <PlusCircle className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 pt-1 pb-4">
        <Section label={t("section.main")} collapsed={collapsed}>
          <NavItem href="/seller/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label={t("nav.dashboard")}
            active={pathname === "/seller/dashboard"} collapsed={collapsed} />
        </Section>

        <Section label={t("section.commerce")} collapsed={collapsed}>
          <NavItem href="/seller/products"      icon={<ShoppingBag className="w-5 h-5" />}     label={t("nav.marketplace")}  active={pathname === "/seller/products"}      collapsed={collapsed} />
          <NavItem href="/seller/my-products"   icon={<Box className="w-5 h-5" />}             label={t("nav.myProducts")}   active={pathname === "/seller/my-products"}   collapsed={collapsed} />
          <NavItem href="/seller/orders/import" icon={<FileSpreadsheet className="w-5 h-5" />} label={t("nav.importExcel")}  active={pathname === "/seller/orders/import"} collapsed={collapsed} />
        </Section>

        <Section label={t("section.orders")} collapsed={collapsed}>
          <NavItem href="/seller/orders/new"    icon={<PlusCircle className="w-5 h-5" />} label={t("nav.newOrder")}  active={pathname === "/seller/orders/new"}    collapsed={collapsed} />
          <NavItem href="/seller/orders/drafts" icon={<FileText className="w-5 h-5" />}   label={t("nav.drafts")}    active={pathname === "/seller/orders/drafts"} collapsed={collapsed} />
          <NavItem href="/seller/batches"       icon={<Package className="w-5 h-5" />}    label={t("nav.batches")}   active={pathname === "/seller/batches"}       collapsed={collapsed} />
          <NavItem href="/seller/tracking"      icon={<MapPin className="w-5 h-5" />}     label={t("nav.tracking")}  active={pathname === "/seller/tracking"}      collapsed={collapsed} />
        </Section>

        <Section label={t("section.account")} collapsed={collapsed}>
          <NavItem
            href="/seller/wallet"
            icon={<Wallet className="w-5 h-5" />}
            label={t("nav.wallet")}
            active={pathname === "/seller/wallet"}
            collapsed={collapsed}
            badge={collapsed ? undefined : `${balance} د.م`}
            badgeColor={balanceNum >= 0 ? "bg-[#10B981]" : "bg-[#EF4444]"}
          />
          <NavItem
            href="/seller/notifications"
            icon={<Bell className="w-5 h-5" />}
            label={t("nav.notifications")}
            active={pathname === "/seller/notifications"}
            collapsed={collapsed}
            badge={unread > 0 ? (unread > 9 ? "9+" : unread) : undefined}
          />
          <NavItem href="/seller/calendar" icon={<CalendarDays className="w-5 h-5" />} label={t("nav.calendar")}
            active={pathname === "/seller/calendar"} collapsed={collapsed} />
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
              <p className="text-[11px] text-slate-400">{t("sidebar.sellerRole")}</p>
            </div>
            <button
              onClick={() => signOut()}
              title={t("nav.logout")}
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
              title={t("nav.logout")}
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
