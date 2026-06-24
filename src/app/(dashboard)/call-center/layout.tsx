"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import NotificationBell from "@/components/ui/NotificationBell";

export default function CallCenterLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] font-sans" dir="rtl">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      {/* Sidebar */}
      <aside
        className={`${isOpen ? "w-64" : "w-[72px]"} bg-[#0F172A] transition-all duration-300 fixed h-full z-40 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/5 flex-shrink-0">
          <div className="w-8 h-8 bg-[#4361EE] rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0">
            W
          </div>
          {isOpen && (
            <div className="mr-3 min-w-0">
              <p className="text-white font-black text-sm leading-none">WinWin COD</p>
              <p className="text-white/40 text-[10px] mt-0.5">كول سنتر 🎧</p>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="mr-auto text-white/30 hover:text-white/80 p-1.5 rounded-lg hover:bg-white/5 transition flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {isOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {isOpen && (
            <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest px-3 mb-2">
              المهام
            </p>
          )}
          <SidebarLink
            href="/call-center/dashboard"
            active={pathname.startsWith("/call-center")}
            isOpen={isOpen}
            icon={
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            }
            label="قائمة التأكيد"
          />
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-white/5 flex-shrink-0">
          <button
            onClick={() => signOut()}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition font-bold text-sm ${!isOpen && "justify-center"}`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            {isOpen && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      <div className={`flex-1 transition-all duration-300 ${isOpen ? "mr-64" : "mr-[72px]"} flex flex-col min-h-screen`}>
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-end px-6 sticky top-0 z-30 shadow-sm">
          <NotificationBell />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function SidebarLink({
  href, active, isOpen, icon, label,
}: {
  href: string; active: boolean; isOpen: boolean; icon: React.ReactNode; label: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition font-bold text-sm ${
        active
          ? "bg-[#4361EE] text-white shadow-lg shadow-blue-900/40"
          : "text-white/50 hover:text-white hover:bg-white/5"
      } ${!isOpen ? "justify-center" : ""}`}
    >
      {icon}
      {isOpen && <span>{label}</span>}
    </Link>
  );
}
