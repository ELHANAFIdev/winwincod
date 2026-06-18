"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

type SellerCard = { id: string; name: string; pendingCount: number; totalCOD: number };
type Stats = { totalToday: number; confirmedToday: number; cancelledToday: number; pending: number };

export default function CallCenterDashboard() {
  const [sellers, setSellers] = useState<SellerCard[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/call-center/sellers")
      .then((res) => {
        setSellers(res.data.sellers ?? []);
        setStats(res.data.stats ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#4361EE] border-t-transparent" />
        <span className="text-[#4361EE] font-bold">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black text-[#0F172A]">قائمة التأكيد</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          البائعون الذين لديهم طلبات بانتظار التأكيد
        </p>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="طلبات اليوم"
            value={stats.totalToday}
            icon={<ClipboardIcon />}
            bgColor="bg-[#EEF2FF]"
            iconColor="text-[#4361EE]"
            valueColor="text-[#4361EE]"
          />
          <StatCard
            label="تم التأكيد"
            value={stats.confirmedToday}
            icon={<CheckIcon />}
            bgColor="bg-green-50"
            iconColor="text-green-600"
            valueColor="text-green-600"
          />
          <StatCard
            label="ملغي"
            value={stats.cancelledToday}
            icon={<XIcon />}
            bgColor="bg-red-50"
            iconColor="text-red-500"
            valueColor="text-red-500"
          />
          <StatCard
            label="في الانتظار"
            value={stats.pending}
            icon={<ClockIcon />}
            bgColor="bg-orange-50"
            iconColor="text-[#FB923C]"
            valueColor="text-[#FB923C]"
          />
        </div>
      )}

      {/* Sellers */}
      {sellers.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] p-20 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <p className="font-black text-[#0F172A] text-xl">لا توجد طلبات معلقة</p>
          <p className="text-slate-400 text-sm mt-2">عمل رائع! كل الطلبات تمت معالجتها.</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-[#0F172A] text-sm">
              {sellers.length} بائع · {stats?.pending ?? 0} طلب إجمالي
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sellers.map((seller) => (
              <SellerCardComponent key={seller.id} seller={seller} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label, value, icon, bgColor, iconColor, valueColor,
}: {
  label: string; value: number; icon: React.ReactNode;
  bgColor: string; iconColor: string; valueColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 flex items-center gap-4">
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className={`text-2xl font-black ${valueColor}`}>{value}</p>
        <p className="text-slate-400 text-xs font-bold mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function SellerCardComponent({ seller }: { seller: SellerCard }) {
  const initials = seller.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  const avatarColors = [
    "bg-[#4361EE]", "bg-violet-500", "bg-cyan-500",
    "bg-emerald-500", "bg-rose-500", "bg-amber-500",
  ];
  const colorIdx = seller.name.charCodeAt(0) % avatarColors.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 flex flex-col gap-4 hover:shadow-md hover:border-[#4361EE]/20 transition group">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={`w-12 h-12 ${avatarColors[colorIdx]} rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0`}
        >
          {initials || seller.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-[#0F172A] truncate">{seller.name}</h3>
          <p className="text-slate-400 text-xs mt-0.5">بائع</p>
        </div>
        {/* Pending badge */}
        <span className="flex-shrink-0 bg-[#FB923C]/10 text-[#FB923C] font-black text-sm px-3 py-1.5 rounded-xl border border-[#FB923C]/20">
          {seller.pendingCount}
        </span>
      </div>

      <div className="flex items-center justify-between bg-[#F8FAFC] rounded-xl px-4 py-3 border border-[#E2E8F0]">
        <div>
          <p className="text-[10px] text-slate-400 font-bold">إجمالي COD</p>
          <p className="font-black text-green-600 text-lg leading-none mt-0.5">
            {seller.totalCOD.toFixed(2)}{" "}
            <span className="text-xs font-normal text-slate-400">د.م</span>
          </p>
        </div>
        <div className="text-left">
          <p className="text-[10px] text-slate-400 font-bold">طلبات معلقة</p>
          <p className="font-black text-[#FB923C] text-lg leading-none mt-0.5">{seller.pendingCount}</p>
        </div>
      </div>

      <Link
        href={`/call-center/sellers/${seller.id}`}
        className="w-full py-2.5 bg-[#4361EE] hover:bg-[#3254D4] text-white rounded-xl font-bold text-sm text-center transition shadow-sm group-hover:shadow-md"
      >
        عرض الطلبات ←
      </Link>
    </div>
  );
}

// Icons
function ClipboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
