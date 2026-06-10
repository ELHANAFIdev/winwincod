"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LandingNavbar({
  isLoggedIn,
  dashboardUrl,
}: {
  isLoggedIn: boolean;
  dashboardUrl: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkCls = `text-sm font-bold transition ${
    scrolled ? "text-[#1E293B] hover:text-[#4361EE]" : "text-white/90 hover:text-white"
  }`;

  return (
    <nav
      dir="rtl"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-lg shadow-slate-200/60" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 flex-shrink-0">
          <span className={`text-2xl font-black leading-none ${scrolled ? "text-[#4361EE]" : "text-white"}`}>
            WinWin
          </span>
          <span className="text-2xl font-black leading-none text-[#FB923C]">COD</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features"    className={linkCls}>الميزات</a>
          <a href="#how-it-works" className={linkCls}>كيف يعمل</a>
          <a href="#pricing"     className={linkCls}>الأسعار</a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href={dashboardUrl}
              className="bg-[#FB923C] hover:bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-black transition shadow-md shadow-orange-200"
            >
              لوحة التحكم
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={`text-sm font-bold transition ${scrolled ? "text-slate-500 hover:text-[#4361EE]" : "text-white/80 hover:text-white"}`}
              >
                دخول
              </Link>
              <Link
                href="/register"
                className="bg-[#FB923C] hover:bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-black transition shadow-md shadow-orange-200"
              >
                ابدأ مجاناً
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden p-2 rounded-lg ${scrolled ? "text-[#1E293B]" : "text-white"}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="القائمة"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#E2E8F0] px-6 py-4 space-y-3 shadow-lg">
          <a href="#features"     onClick={() => setMenuOpen(false)} className="block text-sm font-bold text-[#1E293B] py-2">الميزات</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block text-sm font-bold text-[#1E293B] py-2">كيف يعمل</a>
          <a href="#pricing"      onClick={() => setMenuOpen(false)} className="block text-sm font-bold text-[#1E293B] py-2">الأسعار</a>
          <div className="pt-2 border-t border-[#E2E8F0] flex flex-col gap-2">
            {isLoggedIn ? (
              <Link href={dashboardUrl} className="bg-[#FB923C] text-white px-5 py-2.5 rounded-xl text-sm font-black text-center">لوحة التحكم</Link>
            ) : (
              <>
                <Link href="/login"    className="text-center text-sm font-bold text-slate-500 py-2">دخول</Link>
                <Link href="/register" className="bg-[#FB923C] text-white px-5 py-2.5 rounded-xl text-sm font-black text-center">ابدأ مجاناً</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
