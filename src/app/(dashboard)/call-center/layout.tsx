"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { NavGroup, NavItem } from "@/components/layout/SidebarItems";

export default function CallCenterLayout({ children }: { children: React.ReactNode }) {
  const[isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Sidebar (لون مختلف لتمييز دور الكول سنتر) */}
      <aside className={`${isOpen ? "w-64" : "w-20"} bg-purple-900 text-white transition-all duration-300 fixed h-full z-40 flex flex-col shadow-xl`}>
        <div className="p-6 flex items-center justify-between border-b border-purple-800">
          {isOpen && <h1 className="text-xl font-black">Call Center 🎧</h1>}
          <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:bg-purple-800 p-2 rounded-lg transition">
            {isOpen ? "✕" : "☰"}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
          <NavGroup label="المهام" isOpen={isOpen}>
            {/* استخدمنا isAdmin=true هنا لكي يأخذ التنسيق الداكن من SidebarItems */}
            <NavItem href="/call-center/dashboard" icon="📞" label="قائمة التأكيد" active={pathname === "/call-center/dashboard"} isOpen={isOpen} isAdmin />
          </NavGroup>
        </nav>

        <div className="p-4 border-t border-purple-800">
          <button onClick={() => signOut()} className={`w-full flex items-center gap-3 p-3 rounded-xl text-red-300 hover:bg-red-900/50 transition font-bold ${!isOpen && "justify-center"}`}>
            <span>🚪</span>
            {isOpen && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isOpen ? "mr-64" : "mr-20"} p-8`}>
        {children}
      </main>
    </div>
  );
}