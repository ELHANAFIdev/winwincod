"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, Search, ChevronDown, LogOut, User, Settings } from "lucide-react";
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

interface TopNavbarProps {
  onMenuToggle: () => void;
  role: "admin" | "seller" | "call-center";
}

export default function TopNavbar({ onMenuToggle, role }: TopNavbarProps) {
  const { data: session } = useSession();
  const router  = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName    = (session?.user as any)?.name ?? "مستخدم";
  const userRole    = ROLE_LABELS[(session?.user as any)?.role ?? ""] ?? "مستخدم";
  const userInitial = userName.charAt(0).toUpperCase();

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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 flex-shrink-0">
      {/* Right side: hamburger (mobile) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition md:hidden"
          aria-label="تبديل القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Left side: search + bell + avatar */}
      <div className="flex items-center gap-2">
        {/* Search — desktop */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 w-[200px]">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="بحث..."
            className="bg-transparent text-sm outline-none w-full text-slate-600 placeholder:text-slate-400"
          />
        </div>

        <NotificationBell />

        <div className="w-px h-7 bg-slate-200 mx-1" />

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 hover:bg-slate-50 rounded-xl px-2 py-1.5 transition"
          >
            <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
              {userInitial}
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-slate-800 leading-tight">{userName}</p>
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
                <User className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span>الملف الشخصي</span>
              </button>
              <button
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition text-right"
              >
                <Settings className="w-4 h-4 flex-shrink-0 text-slate-400" />
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
