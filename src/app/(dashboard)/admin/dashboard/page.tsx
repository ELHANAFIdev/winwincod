import prisma from "@/lib/prisma";
import ActivityTable from "./ActivityTable";
import DateFilter from "./DateFilter";

type SearchParams = Promise<{ from?: string; to?: string }>;

function fmtRef(id: string, prefix: string) {
  return `${prefix}-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const MEDALS = ["🥇", "🥈", "🥉"];
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

  const periodFrom = sp.from
    ? new Date(sp.from)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const periodTo = sp.to ? new Date(sp.to + "T23:59:59") : now;

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "RETURNED" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { createdAt: { gte: periodFrom, lte: periodTo } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.order.aggregate({
      where: { status: "DELIVERED", createdAt: { gte: periodFrom, lte: periodTo } },
      _sum: { codAmount: true },
    }),
    prisma.order.count({
      where: { status: { in: ["PENDING_CONFIRMATION", "PROCESSING"] } },
    }),
    prisma.wallet.aggregate({ _sum: { balance: true } }),
    prisma.user.count({ where: { role: "SELLER", isActive: true } }),
    prisma.order.findMany({
      take: 60,
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
      orderBy: { _count: { sellerId: "desc" } },
      take: 5,
    }),
    prisma.order.groupBy({
      by: ["sellerId"],
      _sum: { codAmount: true },
      where: { status: "DELIVERED" },
    }),
    prisma.order.findMany({
      where: { status: { in: ["DELIVERED", "SHIPPED", "PROCESSING"] } },
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

  const isCustomPeriod = !!sp.from || !!sp.to;
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
          <h1 className="text-2xl font-black text-[#1E293B]">لوحة التحكم الرئيسية</h1>
          <p className="text-slate-400 text-sm mt-0.5">نظرة عامة على أداء المنصة</p>
        </div>
        <DateFilter from={fromStr} to={toStr} />
      </div>

      {/* ── Row 1: Period summary (4 compact cards) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={isCustomPeriod ? "طلبات الفترة" : "طلبات هذا الشهر"}
          value={periodOrders.toLocaleString("ar-MA")}
          icon="📦"
          iconBg="#EEF2FF"
          color="#4361EE"
          sub={isCustomPeriod ? `${fromStr} ← ${toStr}` : undefined}
        />
        <StatCard
          label={isCustomPeriod ? "إيرادات الفترة" : "إيرادات هذا الشهر"}
          value={`${periodRev.toLocaleString("ar-MA", { maximumFractionDigits: 0 })} د.م`}
          icon="💰"
          iconBg="#ECFDF5"
          color="#059669"
        />
        <StatCard
          label="طلبات قيد الانتظار"
          value={pendingCount.toLocaleString("ar-MA")}
          icon="⏳"
          iconBg="#FFF7ED"
          color="#EA580C"
        />
        <StatCard
          label="معدل الإرجاع"
          value={`${returnRate}%`}
          icon="↩️"
          iconBg="#FEF2F2"
          color="#DC2626"
        />
      </div>

      {/* ── Row 2: KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Platform Profit */}
        <div className="bg-gradient-to-br from-[#4361EE] to-[#3254D4] p-5 rounded-2xl text-white shadow-lg shadow-blue-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-20 h-20 bg-white/5 rounded-full -translate-x-6 -translate-y-6" />
          <div className="relative z-10">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg mb-3">
              💹
            </div>
            <p className="text-blue-100 text-xs font-bold mb-1">ربح المنصة المتوقع</p>
            <p className="text-2xl font-black">
              {platformProfit.toLocaleString("ar-MA", { maximumFractionDigits: 0 })}{" "}
              <span className="text-sm font-bold opacity-80">د.م</span>
            </p>
            <p className="text-[10px] text-blue-200 mt-2">الفرق بين سعر المورد وسعر البائع</p>
          </div>
        </div>

        {/* Delivery Rate */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center text-lg mb-3">✅</div>
          <p className="text-slate-400 text-xs font-bold mb-1">نسبة نجاح التوصيل</p>
          <p className="text-2xl font-black text-green-600">{deliveryRate}%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-green-500 h-full rounded-full" style={{ width: `${deliveryRate}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {deliveredOrders.toLocaleString("ar-MA")} من{" "}
            {(deliveredOrders + returnedOrders).toLocaleString("ar-MA")}
          </p>
        </div>

        {/* Today's Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-lg mb-3">🔥</div>
          <p className="text-slate-400 text-xs font-bold mb-1">طلبات اليوم</p>
          <p className="text-2xl font-black text-[#FB923C]">
            {todayOrders.toLocaleString("ar-MA")}
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#FB923C] h-full rounded-full"
              style={{
                width: `${totalOrders > 0 ? Math.min((todayOrders / Math.max(periodOrders, 1)) * 30 * 100, 100) : 0}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            من إجمالي {totalOrders.toLocaleString("ar-MA")} طلب
          </p>
        </div>

        {/* Active Sellers */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-lg mb-3">👥</div>
          <p className="text-slate-400 text-xs font-bold mb-1">البائعون النشطون</p>
          <p className="text-2xl font-black text-[#1E293B]">
            {activeSellers.toLocaleString("ar-MA")}
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-purple-400 h-full rounded-full" style={{ width: "70%" }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            سيولة:{" "}
            {walletBalance.toLocaleString("ar-MA", { maximumFractionDigits: 0 })} د.م
          </p>
        </div>
      </div>

      {/* ── Row 3: Status Boxes (4 compact) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="إجمالي الطلبات" value={totalOrders.toLocaleString("ar-MA")} icon="📊" iconBg="#EEF2FF" color="#4361EE" tint="#EEF2FF" />
        <StatCard label="في الطريق" value={shippedOrders.toLocaleString("ar-MA")} icon="🚚" iconBg="#FFFBEB" color="#B45309" tint="#FFFBEB" />
        <StatCard label="تم التسليم" value={deliveredOrders.toLocaleString("ar-MA")} icon="✅" iconBg="#ECFDF5" color="#065F46" tint="#ECFDF5" />
        <StatCard label="مرتجعات" value={returnedOrders.toLocaleString("ar-MA")} icon="↩️" iconBg="#FEF2F2" color="#991B1B" tint="#FEF2F2" />
      </div>

      {/* ── Activity Table + Top Sellers ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ActivityTable orders={serializedOrders} />
        </div>

        {/* Top 5 Sellers */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
          <h3 className="font-black text-[#1E293B] text-lg mb-1">أفضل 5 بائعين</h3>
          <p className="text-slate-400 text-xs mb-5">مرتبون حسب إجمالي الطلبات</p>

          {topSellers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">👥</p>
              <p className="text-slate-400 text-sm font-bold">لا توجد بيانات بعد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topSellers.map((seller, idx) => (
                <div
                  key={seller.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition"
                >
                  <div className="w-7 flex-shrink-0 text-center">
                    {idx < 3 ? (
                      <span className="text-xl">{MEDALS[idx]}</span>
                    ) : (
                      <span className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-400">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${AVATAR_COLORS[idx]}`}
                  >
                    {seller.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1E293B] text-sm truncate">{seller.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{fmtRef(seller.id, "SLR")}</p>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <p className="text-sm font-black text-[#4361EE]">
                      {seller.orderCount.toLocaleString("ar-MA")} طلب
                    </p>
                    <p className="text-[10px] text-slate-400">
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
  label,
  value,
  icon,
  iconBg,
  color,
  tint,
  sub,
}: {
  label: string;
  value: string;
  icon: string;
  iconBg: string;
  color: string;
  tint?: string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-2xl border border-black/5 shadow-sm p-4"
      style={{ background: tint ?? "#ffffff" }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-bold leading-tight" style={{ color, opacity: 0.7 }}>
          {label}
        </p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
          style={{ background: tint ? "rgba(255,255,255,0.6)" : iconBg }}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-black" style={{ color }}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-slate-400 mt-1.5 font-mono">{sub}</p>}
    </div>
  );
}
