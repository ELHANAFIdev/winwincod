"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { NavGroup, NavItem } from "@/components/layout/SidebarItems";
import { CartProvider, useCart } from "@/context/CartContext";
import { CartDrawer } from "@/components/seller/CartDrawer";
import axios from "axios";

function SellerLayoutInner({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [balance, setBalance] = useState("0.00");
  const pathname = usePathname();
  const { totalCount, openDrawer } = useCart();

  useEffect(() => {
    axios.get("/api/seller/wallet")
      .then(res => { if (res.data.balance !== undefined) setBalance(Number(res.data.balance).toFixed(2)); })
      .catch(() => {});
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans" dir="rtl">
      {/* Sidebar */}
      <aside className={`${isOpen ? "w-64" : "w-20"} bg-[#3254D4] transition-all duration-300 fixed h-full z-40 flex flex-col shadow-xl shadow-blue-900/20`}>
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          {isOpen && (
            <div>
              <img src="/logo-white.svg" alt="WinWin COD" className="h-8 w-auto" />
              <p className="text-[10px] text-white/50 font-medium mt-1">لوحة البائع</p>
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

            {/* Cart icon */}
            <button
              onClick={openDrawer}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-[#EEF2FF] hover:bg-[#4361EE] text-[#4361EE] hover:text-white transition group"
              aria-label="السلة"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
              </svg>
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {totalCount > 9 ? "9+" : totalCount}
                </span>
              )}
            </button>

            <div className="w-9 h-9 bg-[#4361EE] rounded-full flex items-center justify-center text-white font-black text-sm">
              S
            </div>
          </div>
        </header>

        <div className="p-8 flex-1">{children}</div>
      </main>

      <CartDrawer />
    </div>
  );
}

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SellerLayoutInner>{children}</SellerLayoutInner>
    </CartProvider>
  );
}
