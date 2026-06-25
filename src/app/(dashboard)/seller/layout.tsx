"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard, ShoppingBag, Box, FileSpreadsheet, PlusCircle,
  FileText, Package, MapPin, Wallet, Bell, BarChart3, LogOut,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import axios from "axios";
import TopNavbar from "@/components/layout/TopNavbar";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/seller/CartDrawer";
import MobileNav from "@/components/layout/MobileNav";
import type { ReactNode } from "react";

// ─── Sidebar nav item ─────────────────────────────────────────────────────────

function SidebarItem({
  href, icon, label, active, collapsed, badge, badgeColor = "bg-red-500",
}: {
  href: string; icon: ReactNode; label: string;
  active: boolean; collapsed: boolean; badge?: string | number; badgeColor?: string;
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
      {!collapsed && badge !== undefined && badge !== 0 && badge !== "0.00" ? (
        <span className={`ml-auto ${badgeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none`}>
          {badge}
        </span>
      ) : null}
      {collapsed && badge !== undefined && badge !== 0 && badge !== "0.00" ? (
        <span className={`absolute top-1 right-1 w-2 h-2 ${badgeColor} rounded-full`} />
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

// ─── Inner layout (uses cart context) ─────────────────────────────────────────

function SellerLayoutInner({ children }: { children: ReactNode }) {
  const pathname   = usePathname();
  const [collapsed, setCollapsed]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [balance, setBalance]         = useState("0.00");
  const [unread, setUnread]           = useState(0);

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

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const sidebarW = collapsed ? "md:w-[70px]" : "md:w-[260px]";
  const mainMr   = collapsed ? "md:mr-[70px]" : "md:mr-[260px]";
  const balanceNum = Number(balance);

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
        {/* Logo + collapse */}
        <div className={`flex items-center border-b border-white/10 flex-shrink-0 ${collapsed ? "justify-center p-4" : "justify-between px-5 py-4"}`}>
          {!collapsed && (
            <div>
              <img src="/logo-white.svg" alt="WinWin COD" className="h-8 w-auto" />
              <p className="text-[10px] text-white/50 font-medium mt-1">لوحة البائع</p>
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
            <SidebarItem href="/seller/dashboard"  icon={<LayoutDashboard className="w-5 h-5" />} label="لوحة القيادة"
              active={pathname === "/seller/dashboard"} collapsed={collapsed} />
          </SidebarSection>

          <SidebarSection label="التجارة" collapsed={collapsed}>
            <SidebarItem href="/seller/products"      icon={<ShoppingBag className="w-5 h-5" />}    label="سوق المنتجات" active={pathname === "/seller/products"}      collapsed={collapsed} />
            <SidebarItem href="/seller/my-products"   icon={<Box className="w-5 h-5" />}            label="منتجاتي"      active={pathname === "/seller/my-products"}   collapsed={collapsed} />
            <SidebarItem href="/seller/orders/import" icon={<FileSpreadsheet className="w-5 h-5" />} label="استيراد Excel" active={pathname === "/seller/orders/import"} collapsed={collapsed} />
          </SidebarSection>

          <SidebarSection label="الطلبات" collapsed={collapsed}>
            <SidebarItem href="/seller/orders/new"    icon={<PlusCircle className="w-5 h-5" />} label="إضافة طلب"    active={pathname === "/seller/orders/new"}    collapsed={collapsed} />
            <SidebarItem href="/seller/orders/drafts" icon={<FileText className="w-5 h-5" />}   label="المسودات"     active={pathname === "/seller/orders/drafts"} collapsed={collapsed} />
            <SidebarItem href="/seller/batches"       icon={<Package className="w-5 h-5" />}    label="الدفعات"      active={pathname === "/seller/batches"}       collapsed={collapsed} />
            <SidebarItem href="/seller/tracking"      icon={<MapPin className="w-5 h-5" />}     label="تتبع الطلبات" active={pathname === "/seller/tracking"}      collapsed={collapsed} />
          </SidebarSection>

          <SidebarSection label="الحساب" collapsed={collapsed}>
            <SidebarItem
              href="/seller/wallet"
              icon={<Wallet className="w-5 h-5" />}
              label="المحفظة"
              active={pathname === "/seller/wallet"}
              collapsed={collapsed}
              badge={collapsed ? undefined : `${balance} د.م`}
              badgeColor={balanceNum >= 0 ? "bg-green-500" : "bg-red-500"}
            />
            <SidebarItem
              href="/seller/notifications"
              icon={<Bell className="w-5 h-5" />}
              label="الإشعارات"
              active={pathname === "/seller/notifications"}
              collapsed={collapsed}
              badge={unread > 0 ? (unread > 9 ? "9+" : unread) : undefined}
              badgeColor="bg-red-500"
            />
            <SidebarItem href="/seller/dashboard"  icon={<BarChart3 className="w-5 h-5" />} label="الإحصائيات" active={false} collapsed={collapsed} />
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
        <TopNavbar onMenuToggle={() => setMobileOpen((v) => !v)} role="seller" />
        <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8">{children}</div>
      </div>

      <CartDrawer />
      <MobileNav role="seller" />
    </div>
  );
}

// ─── Exported layout (wraps with CartProvider) ────────────────────────────────

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <SellerLayoutInner>{children}</SellerLayoutInner>
    </CartProvider>
  );
}
