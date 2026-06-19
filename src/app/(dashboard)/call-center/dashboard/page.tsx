"use client";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Link from "next/link";

type SellerCard = {
  id: string; name: string; pendingCount: number; totalCOD: number;
  latestOrderAt: string; oldestOrderAt: string;
};
type Stats = {
  totalToday: number; confirmedToday: number; cancelledToday: number;
  pending: number; codToday: number; confirmationRate: number;
};

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "للتو";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${Math.floor(hours / 24)} يوم`;
}

export default function CallCenterDashboard() {
  const [sellers, setSellers] = useState<SellerCard[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"count" | "oldest">("count");

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

  const displayedSellers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q ? sellers.filter((s) => s.name.toLowerCase().includes(q)) : sellers;
    if (sort === "oldest") {
      return [...filtered].sort((a, b) => new Date(a.oldestOrderAt).getTime() - new Date(b.oldestOrderAt).getTime());
    }
    return [...filtered].sort((a, b) => b.pendingCount - a.pendingCount);
  }, [sellers, search, sort]);

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

      {/* Stats bar — 6 cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
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
          <StatCard
            label="إجمالي COD اليوم"
            value={`${stats.codToday.toFixed(0)} د.م`}
            icon={<MoneyIcon />}
            bgColor="bg-emerald-50"
            iconColor="text-emerald-600"
            valueColor="text-emerald-600"
          />
          <StatCard
            label="نسبة التأكيد %"
            value={`${stats.confirmationRate}%`}
            icon={<PercentIcon />}
            bgColor="bg-violet-50"
            iconColor="text-violet-600"
            valueColor="text-violet-600"
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
        <div className="space-y-4">
          {/* Search & Sort bar */}
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              placeholder="بحث عن بائع..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[180px] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#4361EE] bg-white"
              dir="rtl"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "count" | "oldest")}
              className="border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#4361EE]"
            >
              <option value="count">الأكثر طلبات</option>
              <option value="oldest">الأقدم طلباً</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="font-black text-[#0F172A] text-sm">
              {displayedSellers.length} بائع · {stats?.pending ?? 0} طلب إجمالي
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayedSellers.map((seller) => (
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
  label: string; value: number | string; icon: React.ReactNode;
  bgColor: string; iconColor: string; valueColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 flex items-center gap-4 min-w-0">
      <div className={`w-11 h-11 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-xl font-black ${valueColor} leading-none truncate`}>{value}</p>
        <p className="text-slate-400 text-[11px] font-bold mt-1 leading-tight">{label}</p>
      </div>
    </div>
  );
}

function SellerCardComponent({ seller }: { seller: SellerCard }) {
  const initials = seller.name.split(" ").slice(0, 2).map((w) => w[0]).join("");
  const avatarColors = [
    "bg-[#4361EE]", "bg-violet-500", "bg-cyan-500",
    "bg-emerald-500", "bg-rose-500", "bg-amber-500",
  ];
  const colorIdx = seller.name.charCodeAt(0) % avatarColors.length;
  const isUrgent = seller.oldestOrderAt
    ? Date.now() - new Date(seller.oldestOrderAt).getTime() > 2 * 60 * 60 * 1000
    : false;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col gap-4 hover:shadow-md transition group ${
      isUrgent ? "border-red-300 hover:border-red-300" : "border-[#E2E8F0] hover:border-[#4361EE]/20"
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 ${avatarColors[colorIdx]} rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0`}>
          {initials || seller.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-[#0F172A] truncate">{seller.name}</h3>
            {isUrgent && (
              <span className="flex-shrink-0 text-xs font-black px-2 py-0.5 rounded-lg bg-red-100 text-red-600 border border-red-200">
                ⚠️ عاجل
              </span>
            )}
          </div>
          {seller.latestOrderAt && (
            <p className="text-slate-400 text-xs mt-0.5">{timeAgo(seller.latestOrderAt)}</p>
          )}
        </div>
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
function MoneyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  );
}
function PercentIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}
