"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import SellerSidebar from "@/components/layout/SellerSidebar";
import TopNavbar from "@/components/layout/TopNavbar";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/seller/CartDrawer";
import MobileNav from "@/components/layout/MobileNav";
import type { ReactNode } from "react";

function SellerLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setMobileOpen(false)} />
      )}

      <SellerSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar onMenuToggle={() => setMobileOpen((v) => !v)} role="seller" />
        <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8">{children}</div>
      </div>

      <CartDrawer />
      <MobileNav role="seller" />
    </div>
  );
}

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <SellerLayoutInner>{children}</SellerLayoutInner>
    </CartProvider>
  );
}
