"use client";
import Link from "next/link";

// 1. مكون المجموعة (NavGroup) - يظهر العنوان فقط إذا كانت القائمة مفتوحة
export function NavGroup({ label, children, isOpen }: any) {
  return (
    <div className="space-y-1">
      {isOpen && (
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2 mt-4">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

// 2. مكون الرابط (NavItem) - يدعم التنسيق الداكن (Admin) والفاتح (Seller)
export function NavItem({ href, icon, label, active, isOpen, highlight = false, isAdmin = false }: any) {
  
  // تنسيق ألوان البائع (Light Theme)
  const sellerClass = active 
    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 rounded-l-none" 
    : "hover:bg-gray-50 text-gray-600 rounded-xl";

  // تنسيق ألوان المدير (Dark Theme)
  const adminClass = active 
    ? (highlight ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-800 text-white border-l-4 border-blue-500 rounded-l-none") 
    : (highlight ? "border border-blue-500/30 text-blue-400 hover:bg-blue-500/10" : "hover:bg-slate-800 hover:text-white rounded-xl text-slate-400");

  const baseClass = isAdmin ? adminClass : sellerClass;

  return (
    <Link 
      href={href}
      className={`flex items-center gap-4 p-3 transition-all duration-200 whitespace-nowrap overflow-hidden
      ${baseClass} ${!isOpen && "justify-center px-0"}`}
      title={label}
    >
      <span className="text-xl min-w-[24px] flex justify-center">{icon}</span>
      {isOpen && <span className="text-sm font-bold truncate">{label}</span>}
    </Link>
  );
}