"use client";
import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import {
  ClipboardList, CheckCircle2, XCircle, Clock, Banknote, Percent,
  Phone, Search, AlertTriangle,
} from "lucide-react";

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
  const { data: session } = useSession();
  const agentName = (session?.user as any)?.name ?? "كول سنتر";

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
    <div className="space-y-6">
      {/* ── Hero Banner ──────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4361EE] via-[#4361EE] to-[#3254D4] p-7 text-white shadow-lg shadow-[#4361EE]/20">
        <div className="absolute -top-5 -right-5 w-36 h-36 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-8 right-1/3 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 -left-6 w-24 h-24 bg-[#FB923C]/20 rounded-full pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-blue-200 text-sm font-medium">مرحباً، {agentName}</p>
            </div>
            <h1 className="text-2xl font-black tracking-tight">قائمة التأكيد</h1>
            <p className="text-blue-100/80 text-sm mt-1 font-medium">
              البائعون الذين لديهم طلبات بانتظار التأكيد
            </p>
          </div>
          {stats && (
            <div className="flex items-center gap-3">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[88px] border border-white/10">
                <p className="text-2xl font-black leading-none">{stats.pending}</p>
                <p className="text-blue-200 text-[11px] font-semibold mt-1">معلقة الآن</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[88px] border border-white/10">
                <p className="text-2xl font-black leading-none">{stats.totalToday}</p>
                <p className="text-blue-200 text-[11px] font-semibold mt-1">طلبات اليوم</p>
              </div>
              <div className="bg-[#FB923C]/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[88px] border border-[#FB923C]/30">
                <p className="text-2xl font-black leading-none text-orange-200">{stats.confirmationRate}%</p>
                <p className="text-orange-200 text-[11px] font-semibold mt-1">نسبة التأكيد</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            label="طلبات اليوم"
            value={stats.totalToday}
            icon={<ClipboardList className="w-6 h-6" />}
            iconBg="bg-[#EEF2FF]"
            iconColor="text-[#4361EE]"
            accent="border-t-[#4361EE]"
          />
          <StatCard
            label="تم التأكيد"
            value={stats.confirmedToday}
            icon={<CheckCircle2 className="w-6 h-6" />}
            iconBg="bg-green-50"
            iconColor="text-green-600"
            accent="border-t-green-500"
          />
          <StatCard
            label="ملغي اليوم"
            value={stats.cancelledToday}
            icon={<XCircle className="w-6 h-6" />}
            iconBg="bg-red-50"
            iconColor="text-red-500"
            accent="border-t-red-500"
          />
          <StatCard
            label="في الانتظار"
            value={stats.pending}
            icon={<Clock className="w-6 h-6" />}
            iconBg="bg-orange-50"
            iconColor="text-[#FB923C]"
            accent="border-t-[#FB923C]"
          />
          <StatCard
            label="COD اليوم"
            value={`${stats.codToday.toFixed(0)} د.م`}
            icon={<Banknote className="w-6 h-6" />}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            accent="border-t-emerald-500"
          />
          <StatCard
            label="نسبة التأكيد"
            value={`${stats.confirmationRate}%`}
            icon={<Percent className="w-6 h-6" />}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            accent="border-t-violet-500"
          />
        </div>
      )}

      {/* ── Sellers ───────────────────────────────────────────── */}
      {sellers.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] p-20 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <p className="font-black text-[#0F172A] text-xl">لا توجد طلبات معلقة</p>
          <p className="text-slate-400 text-sm mt-2">عمل رائع! كل الطلبات تمت معالجتها.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search & Sort bar */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="بحث عن بائع..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-[#E2E8F0] rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:border-[#4361EE] bg-white transition"
                dir="rtl"
              />
            </div>
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
            <p className="font-black text-[#0F172A] text-sm">
              {displayedSellers.length} بائع · {stats?.pending ?? 0} طلب إجمالي
            </p>
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
  label, value, icon, iconBg, iconColor, accent,
}: {
  label: string; value: number | string;
  icon: React.ReactNode; iconBg: string; iconColor: string; accent: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 border-t-4 ${accent} p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group cursor-default`}>
      <div className={`w-11 h-11 ${iconBg} rounded-2xl flex items-center justify-center mb-4 ${iconColor} group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
      <p className="text-3xl font-black text-[#0F172A] leading-none mb-2 tracking-tight">{value}</p>
      <p className="text-xs text-slate-500 font-semibold leading-tight">{label}</p>
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
    <div className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col gap-4 hover:shadow-lg transition-all duration-200 group ${
      isUrgent ? "border-red-200 hover:border-red-300" : "border-[#E2E8F0] hover:border-[#4361EE]/30"
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 ${avatarColors[colorIdx]} rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0`}>
          {initials || seller.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-[#0F172A] truncate">{seller.name}</h3>
            {isUrgent && (
              <span className="flex-shrink-0 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-red-100 text-red-600 border border-red-200">
                <AlertTriangle className="w-3 h-3" />
                عاجل
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
          <p className="text-[10px] text-slate-400 font-semibold">إجمالي COD</p>
          <p className="font-black text-green-600 text-lg leading-none mt-0.5">
            {seller.totalCOD.toFixed(0)}{" "}
            <span className="text-xs font-normal text-slate-400">د.م</span>
          </p>
        </div>
        <div className="text-left">
          <p className="text-[10px] text-slate-400 font-semibold">طلبات معلقة</p>
          <p className="font-black text-[#FB923C] text-lg leading-none mt-0.5">{seller.pendingCount}</p>
        </div>
      </div>

      <Link
        href={`/call-center/sellers/${seller.id}`}
        className="w-full py-2.5 bg-[#4361EE] hover:bg-[#3254D4] text-white rounded-xl font-bold text-sm text-center transition-all shadow-sm group-hover:shadow-md group-hover:shadow-[#4361EE]/20"
      >
        عرض الطلبات
      </Link>
    </div>
  );
}
