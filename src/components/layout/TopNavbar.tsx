"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, Search, ChevronDown, LogOut, User, Settings, Command } from "lucide-react";
import NotificationBell from "@/components/ui/NotificationBell";

const ROLE_LABELS: Record<string, string> = {
  ADMIN:       "مدير النظام",
  SELLER:      "بائع",
  CALL_CENTER: "كول سنتر",
};

const PROFILE_PATHS: Record<string, string> = {
  admin:         "/admin/users",
  seller:        "/seller/dashboard",
  "call-center": "/call-center/dashboard",
};

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard":         "الإحصائيات",
  "/admin/calendar":          "التقويم",
  "/admin/orders":            "إدارة الطلبات",
  "/admin/logistics":         "شحن الطلبيات",
  "/admin/logistics/update":  "تحديث التوصيل",
  "/admin/products":          "المنتجات",
  "/admin/products/new":      "منتج جديد",
  "/admin/suppliers":         "الموردين",
  "/admin/deposits":          "إدارة المحافظ",
  "/admin/withdrawals":       "سحوبات الأرباح",
  "/admin/transactions":      "المعاملات المالية",
  "/admin/users":             "كل المستخدمين",
  "/admin/users/requests":    "طلبات الانضمام",
  "/seller/dashboard":        "لوحة القيادة",
  "/seller/products":         "سوق المنتجات",
  "/seller/my-products":      "منتجاتي",
  "/seller/orders":           "الطلبات",
  "/seller/orders/new":       "إضافة طلب",
  "/seller/orders/import":    "استيراد Excel",
  "/seller/orders/drafts":    "المسودات",
  "/seller/orders/cart":      "السلة",
  "/seller/orders/checkout":  "إتمام الطلب",
  "/seller/batches":          "الدفعات",
  "/seller/tracking":         "تتبع الطلبات",
  "/seller/wallet":           "المحفظة",
  "/seller/notifications":    "الإشعارات",
  "/seller/calendar":         "التقويم",
  "/call-center/dashboard":   "لوحة التحكم",
  "/call-center/orders":      "الطلبات",
  "/call-center/sellers":     "البائعون",
};

interface TopNavbarProps {
  onMenuToggle: () => void;
  role: "admin" | "seller" | "call-center";
}

export default function TopNavbar({ onMenuToggle, role }: TopNavbarProps) {
  const { data: session } = useSession();
  const router   = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName    = (session?.user as any)?.name ?? "مستخدم";
  const userRole    = ROLE_LABELS[(session?.user as any)?.role ?? ""] ?? "مستخدم";
  const userInitial = userName.charAt(0).toUpperCase();

  const pageTitle = PAGE_TITLES[pathname]
    ?? Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k + "/"))?.[1]
    ?? "WinWinCOD";

  // CTRL+K shortcut focuses the search input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const input = document.getElementById("global-search") as HTMLInputElement | null;
        input?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-100 h-16 flex items-center justify-between px-4 md:px-6 flex-shrink-0 shadow-sm">

      {/* Right side: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition md:hidden"
          aria-label="تبديل القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Page title — desktop */}
        <h1 className="hidden md:block text-lg font-bold text-slate-800">{pageTitle}</h1>
      </div>

      {/* Left side: search + bell + avatar */}
      <div className="flex items-center gap-2">
        {/* Search — desktop */}
        <div className="hidden md:flex items-center gap-2 border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#4361EE]/40 rounded-xl px-3 py-2 w-[240px] transition-all group">
          <Search className="w-4 h-4 text-slate-400 group-hover:text-[#4361EE] flex-shrink-0 transition-colors" />
          <input
            id="global-search"
            type="text"
            placeholder="بحث..."
            className="bg-transparent text-sm outline-none w-full text-slate-600 placeholder:text-slate-400"
          />
          <kbd className="hidden group-hover:flex items-center gap-0.5 text-[10px] text-slate-400 bg-slate-100 border border-slate-200 rounded px-1 py-0.5 leading-none flex-shrink-0 font-mono select-none">
            ⌘K
          </kbd>
        </div>

        <NotificationBell notificationsPath={
          role === "seller" ? "/seller/notifications" : `/${role}/dashboard`
        } />

        <div className="w-px h-7 bg-slate-200 mx-1 hidden md:block" />

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2.5 hover:bg-slate-50 rounded-xl px-2 py-1.5 transition group"
          >
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-[#4361EE] to-[#3254D4] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
                {userInitial}
              </div>
              <span className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-[#10B981] border-2 border-white rounded-full" />
            </div>
            <div className="hidden md:block text-right leading-tight">
              <p className="text-sm font-bold text-slate-800">{userName}</p>
              <p className="text-[11px] text-slate-400">{userRole}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform hidden md:block ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div
              dir="rtl"
              className="absolute left-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50"
            >
              {/* User info header */}
              <div className="px-4 py-3 border-b border-slate-100 mb-1">
                <p className="text-sm font-bold text-slate-800">{userName}</p>
                <p className="text-[11px] text-slate-400">{userRole}</p>
              </div>

              <button
                onClick={() => { setDropdownOpen(false); router.push(PROFILE_PATHS[role] ?? "/"); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition text-right"
              >
                <div className="w-7 h-7 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-[#4361EE]" />
                </div>
                <span>الملف الشخصي</span>
              </button>
              <button
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition text-right"
              >
                <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <span>الإعدادات</span>
              </button>

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition text-right"
              >
                <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                </div>
                <span>تسجيل الخروج</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
