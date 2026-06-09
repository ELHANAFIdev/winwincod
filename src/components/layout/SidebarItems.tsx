"use client";
import Link from "next/link";

export function NavGroup({ label, children, isOpen }: any) {
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

export function NavItem({ href, icon, label, active, isOpen, highlight = false }: any) {
  const activeClass = highlight
    ? "bg-[#FB923C] text-white shadow-lg shadow-orange-500/25 rounded-xl"
    : "bg-[#4361EE] text-white shadow-lg shadow-blue-500/25 rounded-xl";

  const inactiveClass = highlight
    ? "text-orange-200 border border-orange-300/20 hover:bg-white/10 rounded-xl"
    : "text-white/80 hover:bg-white/10 rounded-xl";

  const cls = active ? activeClass : inactiveClass;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-3 transition-all duration-200 whitespace-nowrap overflow-hidden font-bold text-sm
        ${cls} ${!isOpen && "justify-center px-0"}`}
      title={label}
    >
      <span className="text-lg min-w-[22px] flex justify-center">{icon}</span>
      {isOpen && <span className="truncate">{label}</span>}
    </Link>
  );
}
