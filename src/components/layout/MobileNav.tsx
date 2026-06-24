"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Role = "seller" | "admin" | "call-center";

const NAV_ITEMS: Record<Role, Array<{ label: string; icon: string; href: string }>> = {
  seller: [
    { label: "الرئيسية",  icon: "🏠", href: "/seller/dashboard"      },
    { label: "الطلبات",   icon: "📦", href: "/seller/orders"          },
    { label: "المحفظة",   icon: "💰", href: "/seller/wallet"          },
    { label: "الإشعارات", icon: "🔔", href: "/seller/notifications"   },
    { label: "حسابي",     icon: "👤", href: "/seller/profile"         },
  ],
  admin: [
    { label: "الرئيسية",  icon: "🏠", href: "/admin/dashboard"  },
    { label: "البائعين",  icon: "👥", href: "/admin/users"       },
    { label: "الطلبات",   icon: "📦", href: "/admin/orders"      },
    { label: "المالية",   icon: "💰", href: "/admin/deposits"    },
    { label: "الإعدادات", icon: "⚙️", href: "/admin/settings"   },
  ],
  "call-center": [
    { label: "الرئيسية", icon: "🏠", href: "/call-center/dashboard" },
    { label: "الطلبات",  icon: "📋", href: "/call-center/orders"    },
    { label: "حسابي",    icon: "👤", href: "/call-center/profile"   },
  ],
};

export default function MobileNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E2E8F0] flex md:hidden shadow-lg"
      dir="rtl"
    >
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition min-h-[56px] ${
              isActive ? "text-[#4361EE]" : "text-slate-400"
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span
              className={`text-[10px] font-bold leading-none mt-0.5 ${
                isActive ? "text-[#4361EE]" : "text-slate-400"
              }`}
            >
              {item.label}
            </span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-[#4361EE] mt-0.5" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
