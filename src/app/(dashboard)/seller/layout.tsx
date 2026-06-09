"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { NavGroup, NavItem } from "@/components/layout/SidebarItems";
import axios from "axios";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [balance, setBalance] = useState("0.00");
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    axios.get("/api/seller/wallet")
      .then(res => {
        if (res.data.balance) setBalance(Number(res.data.balance).toFixed(2));
      })
      .catch(() => {});
  }, [pathname]);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600">جاري التحميل...</div>;
  }

  // @ts-ignore
  if (session?.user?.isActive === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6" dir="rtl">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg border border-red-100">
          <div className="text-6xl mb-6">⏳</div>
          <h2 className="text-2xl font-black text-red-600 mb-4">حسابك قيد المراجعة</h2>
          <p className="text-gray-600 font-medium leading-relaxed mb-8">
            شكراً لتسجيلك! حسابك الآن بانتظار موافقة الإدارة. لن تتمكن من الدخول إلى لوحة التحكم حتى يتم تفعيله.
          </p>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-red-50 text-red-600 font-bold px-8 py-3 rounded-lg hover:bg-red-100 transition"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans" dir="rtl">
      {/* Sidebar */}
      <aside className={`${isOpen ? "w-64" : "w-20"} bg-[#3254D4] transition-all duration-300 fixed h-full z-40 flex flex-col shadow-xl shadow-blue-900/20`}>
        {/* Logo */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          {isOpen && (
            <div>
              <h1 className="text-lg font-black text-white leading-tight">
                WINWIN <span className="text-[#FB923C]">COD</span>
              </h1>
              <p className="text-[10px] text-white/50 font-medium">لوحة البائع</p>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
          >
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
            <NavItem href="/seller/wallet" icon="💰" label="المحفظة" active={pathname === "/seller/wallet"} isOpen={isOpen} highlight />
            <NavItem href="/seller/dashboard" icon="📊" label="الإحصائيات" active={pathname === "/seller/dashboard"} isOpen={isOpen} />
          </NavGroup>
        </nav>

        {/* Balance widget inside sidebar */}
        {isOpen && (
          <div className="mx-3 mb-3 bg-white/10 rounded-xl p-3 border border-white/10">
            <p className="text-[10px] text-white/50 font-bold mb-1">رصيد المحفظة</p>
            <p className={`text-lg font-black ${Number(balance) >= 0 ? "text-green-300" : "text-red-300"}`}>
              {balance} <span className="text-sm font-bold">د.م</span>
            </p>
          </div>
        )}

        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => signOut()}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-red-300 hover:bg-red-500/15 transition font-bold ${!isOpen && "justify-center"}`}
          >
            <span>🚪</span>
            {isOpen && <span className="text-sm">خروج</span>}
          </button>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isOpen ? "mr-64" : "mr-20"} flex flex-col`}>
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="text-sm font-bold text-[#1E293B]">لوحة تحكم البائع</div>
          <div className="flex items-center gap-3">
            <div className="bg-[#F8FAFC] text-[#1E293B] px-4 py-1.5 rounded-lg font-bold text-sm border border-[#E2E8F0]">
              الرصيد:{" "}
              <span className={Number(balance) >= 0 ? "text-green-600" : "text-red-500"}>
                {balance} د.م
              </span>
            </div>
            <div className="w-9 h-9 bg-[#4361EE] rounded-full flex items-center justify-center text-white font-black text-sm">
              S
            </div>
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
