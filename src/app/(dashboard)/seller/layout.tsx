"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { NavGroup, NavItem } from "@/components/layout/SidebarItems";
import axios from "axios";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const[balance, setBalance] = useState("0.00");
  const pathname = usePathname();

  // جلب الرصيد من الـ API بدلاً من قاعدة البيانات المباشرة لتجنب أخطاء السيرفر
  useEffect(() => {
    axios.get("/api/seller/wallet")
      .then(res => {
        if (res.data.balance) setBalance(Number(res.data.balance).toFixed(2));
      })
      .catch(() => console.log("جاري تحميل المحفظة"));
  }, [pathname]); // تحديث الرصيد عند تغيير الصفحة

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* Sidebar الفاتح */}
      <aside className={`${isOpen ? "w-64" : "w-20"} bg-white border-l border-gray-200 transition-all duration-300 fixed h-full z-40 flex flex-col shadow-sm`}>
        <div className="p-6 flex items-center justify-between border-b border-gray-50">
          {isOpen && <h1 className="text-xl font-black text-blue-600">WINWIN <span className="text-slate-800">COD</span></h1>}
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition">
            {isOpen ? "✕" : "☰"}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
          <NavGroup label="التجارة" isOpen={isOpen}>
            <NavItem href="/seller/products" icon="🏪" label="سوق المنتجات" active={pathname === "/seller/products"} isOpen={isOpen} />
            <NavItem href="/seller/my-products" icon="💼" label="منتجاتي" active={pathname === "/seller/my-products"} isOpen={isOpen} />
            <NavItem href="/seller/orders/import" icon="📥" label="استيراد Excel" active={pathname === "/seller/orders/import"} isOpen={isOpen} />
          </NavGroup>

          <NavGroup label="الطلبات" isOpen={isOpen}>
            <NavItem href="/seller/orders/new" icon="➕" label="إضافة طلب" active={pathname === "/seller/orders/new"} isOpen={isOpen} />
            <NavItem href="/seller/orders/drafts" icon="📝" label="المسودات" active={pathname === "/seller/orders/drafts"} isOpen={isOpen} />
            <NavItem href="/seller/batches" icon="📦" label="الدفعات" active={pathname === "/seller/batches"} isOpen={isOpen} />
          </NavGroup>

          <NavGroup label="المالية" isOpen={isOpen}>
            <NavItem href="/seller/wallet" icon="💰" label="المحفظة" active={pathname === "/seller/wallet"} isOpen={isOpen} />
            <NavItem href="/seller/dashboard" icon="📊" label="الإحصائيات" active={pathname === "/seller/dashboard"} isOpen={isOpen} />
          </NavGroup>
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button onClick={() => signOut()} className={`w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition font-bold ${!isOpen && "justify-center"}`}>
            <span>🚪</span>
            {isOpen && <span>خروج</span>}
          </button>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isOpen ? "mr-64" : "mr-20"} flex flex-col`}>
        {/* Header علوي يظهر الرصيد */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
           <div className="text-sm font-bold text-gray-600">لوحة تحكم البائع</div>
           <div className="flex items-center gap-4">
             <div className="bg-gray-100 text-gray-800 px-4 py-1.5 rounded-lg font-bold text-sm border border-gray-200">
               الرصيد: <span className={Number(balance) >= 0 ? "text-green-600" : "text-red-600"}>{balance} د.م</span>
             </div>
             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border-2 border-blue-200">
               S
             </div>
           </div>
        </header>
        <div className="p-8">
            {children}
        </div>
      </main>
    </div>
  );
}