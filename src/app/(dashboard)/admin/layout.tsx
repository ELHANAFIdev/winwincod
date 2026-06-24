"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { NavGroup, NavItem } from "@/components/layout/SidebarItems";
import NotificationBell from "@/components/ui/NotificationBell";
import MobileNav from "@/components/layout/MobileNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans" dir="rtl">
      {/* Sidebar — hidden on mobile */}
      <aside className={`${isOpen ? "w-64" : "w-20"} hidden md:flex md:flex-col bg-[#3254D4] transition-all duration-300 fixed h-full z-40 shadow-xl shadow-blue-900/20`}>
        {/* Logo */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          {isOpen && (
            <div>
              <img src="/logo-white.svg" alt="WinWin COD" className="h-8 w-auto" />
              <p className="text-[10px] text-white/50 font-medium mt-1">لوحة المدير</p>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
          <NavGroup label="الرئيسية" isOpen={isOpen}>
            <NavItem href="/admin/dashboard" icon="📊" label="الإحصائيات" active={pathname === "/admin/dashboard"} isOpen={isOpen} />
          </NavGroup>

          <NavGroup label="العمليات" isOpen={isOpen}>
            <NavItem href="/admin/orders" icon="📋" label="إدارة الطلبات" active={pathname.startsWith("/admin/orders")} isOpen={isOpen} highlight />
            <NavItem href="/admin/logistics" icon="🚚" label="شحن الطلبيات" active={pathname === "/admin/logistics"} isOpen={isOpen} />
            <NavItem href="/admin/logistics/update" icon="🔄" label="تحديث التوصيل" active={pathname === "/admin/logistics/update"} isOpen={isOpen} />
            <NavItem href="/admin/deposits" icon="💰" label="إدارة المحافظ" active={pathname === "/admin/deposits"} isOpen={isOpen} highlight />
            <NavItem href="/admin/withdrawals" icon="💳" label="سحوبات الأرباح" active={pathname === "/admin/withdrawals"} isOpen={isOpen} highlight />
            <NavItem href="/admin/transactions" icon="📋" label="المعاملات المالية" active={pathname === "/admin/transactions"} isOpen={isOpen} />
          </NavGroup>

          <NavGroup label="المخزون" isOpen={isOpen}>
            <NavItem href="/admin/products" icon="📦" label="المنتجات" active={pathname === "/admin/products"} isOpen={isOpen} />
            <NavItem href="/admin/suppliers" icon="🏭" label="الموردين" active={pathname === "/admin/suppliers"} isOpen={isOpen} />
          </NavGroup>

          <NavGroup label="المستخدمين" isOpen={isOpen}>
            <NavItem href="/admin/users/requests" icon="🔔" label="طلبات الانضمام" active={pathname === "/admin/users/requests"} isOpen={isOpen} />
            <NavItem href="/admin/users" icon="👥" label="كل المستخدمين" active={pathname === "/admin/users"} isOpen={isOpen} />
          </NavGroup>
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => signOut()}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-red-300 hover:bg-red-500/15 transition font-bold ${!isOpen && "justify-center"}`}
          >
            <span>🚪</span>
            {isOpen && <span className="text-sm">تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main with top header */}
      <div className={`flex-1 transition-all duration-300 ${isOpen ? "md:mr-64" : "md:mr-20"} flex flex-col`}>
        <header className="h-14 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm">
          <span className="hidden md:block text-sm font-bold text-slate-400">لوحة تحكم المدير</span>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-8 h-8 bg-[#4361EE] rounded-full flex items-center justify-center text-white font-black text-sm">A</div>
          </div>
        </header>
        <main className="p-4 md:p-8 pb-24 md:pb-8 flex-1">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav role="admin" />
    </div>
  );
}
