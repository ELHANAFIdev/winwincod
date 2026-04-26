"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { NavGroup, NavItem } from "@/components/layout/SidebarItems";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Sidebar */}
      <aside className={`${isOpen ? "w-72" : "w-20"} bg-slate-900 transition-all duration-300 fixed h-full z-40 flex flex-col shadow-2xl`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          {isOpen && <h1 className="text-xl font-black text-white">WINWIN <span className="text-blue-500">ADMIN</span></h1>}
          <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:bg-slate-800 p-2 rounded-lg transition">
            {isOpen ? "✕" : "☰"}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
          <NavGroup label="الرئيسية" isOpen={isOpen}>
            <NavItem href="/admin/dashboard" icon="📊" label="الإحصائيات" active={pathname === "/admin/dashboard"} isOpen={isOpen} isAdmin />
          </NavGroup>

          <NavGroup label="العمليات" isOpen={isOpen}>
            <NavItem href="/admin/logistics" icon="🚚" label="شحن الطلبيات" active={pathname === "/admin/logistics"} isOpen={isOpen} isAdmin />
            <NavItem href="/admin/logistics/update" icon="📡" label="تحديث التوصيل" active={pathname === "/admin/logistics/update"} isOpen={isOpen} isAdmin />
            <NavItem href="/admin/deposits" icon="💰" label="طلبات الشحن" active={pathname === "/admin/deposits"} isOpen={isOpen} isAdmin highlight />
            <NavItem href="/admin/withdrawals" icon="💳" label="سحوبات الأرباح" active={pathname === "/admin/withdrawals"} isOpen={isOpen} isAdmin highlight />
          </NavGroup>

          <NavGroup label="المخزون" isOpen={isOpen}>
            <NavItem href="/admin/products" icon="📦" label="المنتجات" active={pathname === "/admin/products"} isOpen={isOpen} isAdmin />
            <NavItem href="/admin/suppliers" icon="🏭" label="الموردين" active={pathname === "/admin/suppliers"} isOpen={isOpen} isAdmin />
          </NavGroup>

          <NavGroup label="المستخدمين" isOpen={isOpen}>
            <NavItem href="/admin/users/requests" icon="🆕" label="طلبات الانضمام" active={pathname === "/admin/users/requests"} isOpen={isOpen} isAdmin />
            <NavItem href="/admin/users" icon="👥" label="كل المستخدمين" active={pathname === "/admin/users"} isOpen={isOpen} isAdmin />
          </NavGroup>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={() => signOut()} className={`w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-950 transition font-bold ${!isOpen && "justify-center"}`}>
            <span>🚪</span>
            {isOpen && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isOpen ? "mr-72" : "mr-20"} p-8`}>
        {children}
      </main>
    </div>
  );
}