"use client";
import Link from "next/link";
import type { ReactNode } from "react";

export function NavGroup({ label, children, isOpen }: { label: string; children: ReactNode; isOpen: boolean }) {
  return (
    <div className="space-y-1">
      {isOpen && (
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-4 mb-2 mt-4">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

export function NavItem({
  href, icon, label, active, isOpen, highlight = false,
}: {
  href: string; icon: ReactNode; label: string;
  active: boolean; isOpen: boolean; highlight?: boolean;
}) {
  const activeClass = highlight
    ? "bg-[#FB923C] text-white shadow-lg shadow-orange-500/25 rounded-xl"
    : "bg-[#4361EE] text-white shadow-lg shadow-blue-500/25 rounded-xl";

  const inactiveClass = highlight
    ? "text-orange-200 border border-orange-300/20 hover:bg-white/10 rounded-xl"
    : "text-blue-200 hover:bg-white/10 rounded-xl";

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-3 transition-all duration-200 whitespace-nowrap overflow-hidden font-bold text-sm
        ${active ? activeClass : inactiveClass} ${!isOpen && "justify-center px-0"}`}
      title={label}
    >
      <span className="flex-shrink-0 flex justify-center w-5">{icon}</span>
      {isOpen && <span className="truncate">{label}</span>}
    </Link>
  );
}
