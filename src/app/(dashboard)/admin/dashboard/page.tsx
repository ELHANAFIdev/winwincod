import { Suspense } from "react";
import prisma from "@/lib/prisma";
import ActivityTable from "./ActivityTable";
import DateFilter from "./DateFilter";
import { PERIOD_LABELS } from "@/components/ui/DateDropdown";

type SearchParams = Promise<{ from?: string; to?: string; period?: string }>;

function fmtRef(id: string, prefix: string) {
  return `${prefix}-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const AVATAR_COLORS = [
  "bg-yellow-400 text-white",
  "bg-slate-400 text-white",
  "bg-orange-400 text-white",
  "bg-[#4361EE] text-white",
  "bg-purple-400 text-white",
];

export default async function AdminDashboard({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const now = new Date();
  const period = sp.period ?? "month";
  const periodLabel = PERIOD_LABELS[period] ?? "هذا الشهر";

  const periodFrom = sp.from
    ? new Date(sp.from)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const periodTo = sp.to ? new Date(sp.to + "T23:59:59") : now;

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateFilter = { createdAt: { gte: periodFrom, lte: periodTo } };

  const [
    totalOrders,
    deliveredOrders,
    returnedOrders,
    shippedOrders,
    periodOrders,
    todayOrders,
    periodRevAgg,
    pendingCount,
    walletAgg,
    activeSellers,
    recentOrders,
    ordersBySellerTop,
    deliveredRevBySeller,
    finishedOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "DELIVERED", ...dateFilter } }),
    prisma.order.count({ where: { status: "RETURNED", ...dateFilter } }),
    prisma.order.count({ where: { status: "SHIPPED", ...dateFilter } }),
    prisma.order.count({ where: dateFilter }),
    prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.order.aggregate({
      where: { status: "DELIVERED", ...dateFilter },
      _sum: { codAmount: true },
    }),
    prisma.order.count({
      where: { status: { in: ["PENDING_CONFIRMATION", "PROCESSING"] } },
    }),
    prisma.wallet.aggregate({ _sum: { balance: true } }),
    prisma.user.count({ where: { role: "SELLER", isActive: true } }),
    prisma.order.findMany({
      take: 60,
      where: dateFilter,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        productName: true,
        codAmount: true,
        status: true,
        createdAt: true,
        city: true,
        seller: { select: { id: true, name: true } },
      },
    }),
    prisma.order.groupBy({
      by: ["sellerId"],
      _count: { sellerId: true },
      where: dateFilter,
      orderBy: { _count: { sellerId: "desc" } },
      take: 5,
    }),
    prisma.order.groupBy({
      by: ["sellerId"],
      _sum: { codAmount: true },
      where: { status: "DELIVERED", ...dateFilter },
    }),
    prisma.order.findMany({
      where: { status: { in: ["DELIVERED", "SHIPPED", "PROCESSING"] }, ...dateFilter },
      select: {
        quantity: true,
        product: { select: { sellerPrice: true, costPrice: true } },
      },
    }),
  ]);

  const sellerIds = ordersBySellerTop.map((r) => r.sellerId);
  const sellerNames = await prisma.user.findMany({
    where: { id: { in: sellerIds } },
    select: { id: true, name: true },
  });

  const sellerMap = Object.fromEntries(sellerNames.map((s) => [s.id, s.name]));
  const revenueMap = Object.fromEntries(
    deliveredRevBySeller.map((r) => [r.sellerId, Number(r._sum.codAmount ?? 0)])
  );

  const topSellers = ordersBySellerTop
    .filter((r) => sellerMap[r.sellerId])
    .map((r) => ({
      id: r.sellerId,
      name: sellerMap[r.sellerId],
      orderCount: r._count?.sellerId ?? 0,
      revenue: revenueMap[r.sellerId] ?? 0,
    }));

  const deliveryRate =
    deliveredOrders + returnedOrders > 0
      ? ((deliveredOrders / (deliveredOrders + returnedOrders)) * 100).toFixed(1)
      : "0.0";

  const returnRate =
    deliveredOrders + returnedOrders > 0
      ? ((returnedOrders / (deliveredOrders + returnedOrders)) * 100).toFixed(1)
      : "0.0";

  const platformProfit = finishedOrders.reduce((acc, order) => {
    const sp2 = Number(order.product?.sellerPrice ?? 0);
    const cp = Number(order.product?.costPrice ?? 0);
    return acc + (sp2 - cp) * order.quantity;
  }, 0);

  const walletBalance = Number(walletAgg._sum.balance ?? 0);
  const periodRev = Number(periodRevAgg._sum.codAmount ?? 0);
  const fromStr = toYMD(periodFrom);
  const toStr = toYMD(periodTo);

  const serializedOrders = recentOrders.map((o) => ({
    id: o.id,
    ref: fmtRef(o.id, "ORD"),
    productName: o.productName,
    codAmount: Number(o.codAmount),
    status: o.status as string,
    createdAt: o.createdAt.toISOString(),
    city: o.city,
    sellerName: o.seller.name,
    sellerRef: fmtRef(o.seller.id, "SLR"),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">لوحة التحكم الرئيسية</h1>
          <p className="text-[#64748B] text-sm mt-0.5">نظرة عامة على أداء المنصة</p>
        </div>
        <div className="text-sm text-[#64748B] font-medium bg-white px-4 py-2.5 rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] w-fit whitespace-nowrap">
          {now.toLocaleDateString("ar-MA", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Date Filter */}
      <Suspense fallback={<div className="h-14 bg-white rounded-xl border border-[#E2E8F0] animate-pulse" />}>
        <DateFilter period={period} from={fromStr} to={toStr} />
      </Suspense>

      {/* Row 1 — Period summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={`طلبات ${periodLabel}`}
          value={periodOrders.toLocaleString("ar-MA")}
          icon="📦"
          iconBg="#EEF2FF"
          borderColor="#4361EE"
        />
        <StatCard
          label={`إيرادات ${periodLabel}`}
          value={`${periodRev.toLocaleString("ar-MA", { maximumFractionDigits: 0 })} د.م`}
          icon="💰"
          iconBg="#ECFDF5"
          borderColor="#10B981"
        />
        <StatCard
          label="طلبات قيد الانتظار"
          value={pendingCount.toLocaleString("ar-MA")}
          icon="⏳"
          iconBg="#FFF7ED"
          borderColor="#FB923C"
        />
        <StatCard
          label={`معدل الإرجاع ${periodLabel}`}
          value={`${returnRate}%`}
          icon="↩️"
          iconBg="#FEF2F2"
          borderColor="#EF4444"
        />
      </div>

      {/* Row 2 — Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Platform Profit */}
        <StatCard
          label={`ربح المنصة — ${periodLabel}`}
          value={`${platformProfit.toLocaleString("ar-MA", { maximumFractionDigits: 0 })} د.م`}
          icon="📈"
          iconBg="#EEF2FF"
          borderColor="#4361EE"
          sub="الفرق بين سعر المورد وسعر البائع"
        />

        {/* Delivery Rate */}
        <div
          className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 hover:-translate-y-px transition-transform"
          style={{ borderLeft: "4px solid #10B981" }}
        >
          <div className="w-10 h-10 bg-[#ECFDF5] rounded-full flex items-center justify-center text-xl mb-3">✅</div>
          <p className="text-[13px] font-medium text-[#64748B] uppercase tracking-wide mb-1">
            نسبة التسليم — {periodLabel}
          </p>
          <p className="text-3xl font-bold text-[#10B981]">{deliveryRate}%</p>
          <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#10B981] h-full rounded-full" style={{ width: `${deliveryRate}%` }} />
          </div>
          <p className="text-[10px] text-[#64748B] mt-2">
            {deliveredOrders.toLocaleString("ar-MA")} من {(deliveredOrders + returnedOrders).toLocaleString("ar-MA")}
          </p>
        </div>

        {/* Today's Orders */}
        <div
          className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 hover:-translate-y-px transition-transform"
          style={{ borderLeft: "4px solid #FB923C" }}
        >
          <div className="w-10 h-10 bg-[#FFF7ED] rounded-full flex items-center justify-center text-xl mb-3">🔥</div>
          <p className="text-[13px] font-medium text-[#64748B] uppercase tracking-wide mb-1">طلبات اليوم</p>
          <p className="text-3xl font-bold text-[#FB923C]">{todayOrders.toLocaleString("ar-MA")}</p>
          <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#FB923C] h-full rounded-full"
              style={{ width: `${totalOrders > 0 ? Math.min((todayOrders / Math.max(periodOrders, 1)) * 30 * 100, 100) : 0}%` }}
            />
          </div>
          <p className="text-[10px] text-[#64748B] mt-2">
            من إجمالي {totalOrders.toLocaleString("ar-MA")} طلب
          </p>
        </div>

        {/* Active Sellers */}
        <StatCard
          label="البائعون النشطون"
          value={activeSellers.toLocaleString("ar-MA")}
          icon="👥"
          iconBg="#EEF2FF"
          borderColor="#4361EE"
          sub={`سيولة: ${walletBalance.toLocaleString("ar-MA", { maximumFractionDigits: 0 })} د.م`}
        />
      </div>

      {/* Row 3 — Status breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="تم التسليم"
          value={deliveredOrders.toLocaleString("ar-MA")}
          icon="✅"
          iconBg="#ECFDF5"
          borderColor="#10B981"
          sub={periodLabel}
        />
        <StatCard
          label="في الطريق"
          value={shippedOrders.toLocaleString("ar-MA")}
          icon="🚚"
          iconBg="#FFFBEB"
          borderColor="#F59E0B"
          sub={periodLabel}
        />
        <StatCard
          label="مرتجعات"
          value={returnedOrders.toLocaleString("ar-MA")}
          icon="↩️"
          iconBg="#FEF2F2"
          borderColor="#EF4444"
          sub={periodLabel}
        />
        <StatCard
          label="سيولة المحافظ"
          value={`${walletBalance.toLocaleString("ar-MA", { maximumFractionDigits: 0 })} د.م`}
          icon="💳"
          iconBg="#EEF2FF"
          borderColor="#4361EE"
          sub="إجمالي أرصدة البائعين"
        />
      </div>

      {/* Activity Table + Top Sellers */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ActivityTable orders={serializedOrders} />
        </div>

        {/* Top 5 Sellers */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6">
          <h3 className="font-bold text-[#1E293B] text-base mb-1">أفضل 5 بائعين</h3>
          <p className="text-[#64748B] text-xs mb-5">{periodLabel} — مرتبون حسب الطلبات</p>

          {topSellers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#94A3B8] text-sm font-medium">لا توجد بيانات بعد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topSellers.map((seller, idx) => (
                <div key={seller.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition">
                  <div className="w-7 flex-shrink-0 text-center">
                    {idx < 3 ? (
                      <span className="text-xl">{["🥇", "🥈", "🥉"][idx]}</span>
                    ) : (
                      <span className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-[#F1F5F9] text-xs font-bold text-[#64748B]">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${AVATAR_COLORS[idx]}`}>
                    {seller.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1E293B] text-sm truncate">{seller.name}</p>
                    <p className="text-[10px] text-[#64748B] font-mono">{fmtRef(seller.id, "SLR")}</p>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <p className="text-sm font-bold text-[#4361EE]">
                      {seller.orderCount.toLocaleString("ar-MA")} طلب
                    </p>
                    <p className="text-[10px] text-[#64748B]">
                      {seller.revenue.toLocaleString("ar-MA", { maximumFractionDigits: 0 })} د.م
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, icon, iconBg, borderColor, sub,
}: {
  label: string; value: string; icon: string; iconBg: string;
  borderColor: string; sub?: string;
}) {
  return (
    <div
      className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 hover:-translate-y-px transition-transform"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-3 flex-shrink-0"
        style={{ background: iconBg }}>
        {icon}
      </div>
      <p className="text-[13px] font-medium text-[#64748B] uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold text-[#1E293B]">{value}</p>
      {sub && <p className="text-[10px] text-[#64748B] mt-1.5">{sub}</p>}
    </div>
  );
}
