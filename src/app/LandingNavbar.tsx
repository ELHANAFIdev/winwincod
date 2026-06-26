"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function LandingNavbar({
  isLoggedIn,
  dashboardUrl,
}: {
  isLoggedIn: boolean;
  dashboardUrl: string;
}) {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const { lang, setLang }         = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBg = scrolled
    ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-100"
    : "bg-transparent";

  const linkCls = `text-sm font-bold transition-colors ${
    scrolled ? "text-[#1E293B] hover:text-[#4361EE]" : "text-white/90 hover:text-white"
  }`;

  return (
    <nav dir="rtl" className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${scrolled ? "bg-[#4361EE]" : "bg-white/20"}`}>
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <div className="leading-none">
            <span className={`text-xl font-black transition-colors ${scrolled ? "text-[#1E293B]" : "text-white"}`}>WinWin</span>
            <span className="text-xl font-black text-[#FB923C]">COD</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features"     className={linkCls}>الميزات</a>
          <a href="#how-it-works" className={linkCls}>كيف يعمل</a>
          <a href="#pricing"      className={linkCls}>الأسعار</a>
        </div>

        {/* Desktop: Lang + CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
            className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
              scrolled
                ? "border-slate-200 hover:border-[#4361EE]/50 text-slate-600"
                : "border-white/30 hover:border-white/60 text-white/80"
            }`}
          >
            <span className={lang === "ar" ? "text-[#FB923C] font-black" : "opacity-50"}>AR</span>
            <span className="opacity-30 select-none mx-0.5">|</span>
            <span className={lang === "fr" ? "text-[#FB923C] font-black" : "opacity-50"}>FR</span>
          </button>

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
          className={`md:hidden p-2 rounded-lg transition ${scrolled ? "text-[#1E293B]" : "text-white"}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="القائمة"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#E2E8F0] px-6 py-4 space-y-1 shadow-xl">
          <a href="#features"     onClick={() => setMenuOpen(false)} className="block text-sm font-bold text-[#1E293B] py-2.5 border-b border-slate-50">الميزات</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block text-sm font-bold text-[#1E293B] py-2.5 border-b border-slate-50">كيف يعمل</a>
          <a href="#pricing"      onClick={() => setMenuOpen(false)} className="block text-sm font-bold text-[#1E293B] py-2.5 border-b border-slate-50">الأسعار</a>
          <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-bold text-slate-400">اللغة / Langue</span>
              <button
                onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs font-bold"
              >
                <span className={lang === "ar" ? "text-[#4361EE] font-black" : "text-slate-400"}>AR</span>
                <span className="text-slate-300">|</span>
                <span className={lang === "fr" ? "text-[#4361EE] font-black" : "text-slate-400"}>FR</span>
              </button>
            </div>
            {isLoggedIn ? (
              <Link href={dashboardUrl} className="block bg-[#FB923C] text-white px-5 py-3 rounded-xl text-sm font-black text-center">
                لوحة التحكم
              </Link>
            ) : (
              <>
                <Link href="/login"    className="block text-center text-sm font-bold text-slate-500 py-2">دخول</Link>
                <Link href="/register" className="block bg-[#FB923C] text-white px-5 py-3 rounded-xl text-sm font-black text-center">
                  ابدأ مجاناً
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
