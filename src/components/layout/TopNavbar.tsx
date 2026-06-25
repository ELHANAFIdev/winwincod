"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, Search, ChevronDown, LogOut, User, Settings } from "lucide-react";
import NotificationBell from "@/components/ui/NotificationBell";

// ─── Page title map ───────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard":         "لوحة التحكم",
  "/admin/orders":            "إدارة الطلبات",
  "/admin/logistics/update":  "تحديث التوصيل",
  "/admin/logistics":         "شحن الطلبيات",
  "/admin/deposits":          "إدارة المحافظ",
  "/admin/withdrawals":       "سحوبات الأرباح",
  "/admin/transactions":      "المعاملات المالية",
  "/admin/products":          "المنتجات",
  "/admin/suppliers":         "الموردين",
  "/admin/users/requests":    "طلبات الانضمام",
  "/admin/users":             "المستخدمين",
  "/seller/dashboard":        "لوحة القيادة",
  "/seller/products":         "سوق المنتجات",
  "/seller/my-products":      "منتجاتي",
  "/seller/orders/import":    "استيراد Excel",
  "/seller/orders/new":       "إضافة طلب",
  "/seller/orders/drafts":    "المسودات",
  "/seller/batches":          "الدفعات",
  "/seller/tracking":         "تتبع الطلبات",
  "/seller/wallet":           "المحفظة",
  "/seller/notifications":    "الإشعارات",
  "/call-center/dashboard":   "قائمة التأكيد",
  "/call-center/orders":      "الطلبات",
  "/call-center/sellers":     "البائعون",
};

function getPageTitle(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const sorted = Object.entries(PAGE_TITLES).sort((a, b) => b[0].length - a[0].length);
  for (const [path, title] of sorted) {
    if (pathname.startsWith(path)) return title;
  }
  return "WinWin COD";
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN:       "مدير النظام",
  SELLER:      "بائع",
  CALL_CENTER: "كول سنتر",
};

const PROFILE_PATHS: Record<string, string> = {
  admin:        "/admin/users",
  seller:       "/seller/dashboard",
  "call-center": "/call-center/dashboard",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface TopNavbarProps {
  onMenuToggle: () => void;
  role: "admin" | "seller" | "call-center";
}

export default function TopNavbar({ onMenuToggle, role }: TopNavbarProps) {
  const { data: session } = useSession();
  const pathname  = usePathname();
  const router    = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName   = (session?.user as any)?.name ?? "مستخدم";
  const userRole   = ROLE_LABELS[(session?.user as any)?.role ?? ""] ?? "مستخدم";
  const userInitial = userName.charAt(0).toUpperCase();
  const pageTitle  = getPageTitle(pathname);

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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm flex-shrink-0">
      {/* Right side (visual right in RTL): hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition md:hidden"
          aria-label="تبديل القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-[#1E293B] hidden sm:block">{pageTitle}</h1>
      </div>

      {/* Left side (visual left in RTL): search + bell + user */}
      <div className="flex items-center gap-3">
        {/* Search — desktop only */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 w-[200px]">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="بحث..."
            className="bg-transparent text-sm outline-none w-full text-slate-600 placeholder:text-slate-400"
          />
        </div>

        <NotificationBell />

        {/* Divider */}
        <div className="w-px h-7 bg-slate-200" />

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 hover:bg-slate-50 rounded-xl px-2 py-1.5 transition"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {userInitial}
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-[#1E293B] leading-tight">{userName}</p>
              <p className="text-[11px] text-slate-400">{userRole}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform hidden md:block ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div
              dir="rtl"
              className="absolute left-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50"
            >
              <button
                onClick={() => { setDropdownOpen(false); router.push(PROFILE_PATHS[role] ?? "/"); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition text-right"
              >
                <User className="w-4 h-4 flex-shrink-0" />
                <span>الملف الشخصي</span>
              </button>
              <button
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition text-right"
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span>الإعدادات</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition text-right"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
