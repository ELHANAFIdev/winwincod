import prisma from "@/lib/prisma";
import ActivityTable from "./ActivityTable";

function fmtRef(id: string, prefix: string) {
  return `${prefix}-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

const MEDALS = ["🥇", "🥈", "🥉"];
const AVATAR_COLORS = [
  "bg-yellow-400 text-white",
  "bg-slate-400 text-white",
  "bg-orange-400 text-white",
  "bg-[#4361EE] text-white",
  "bg-purple-400 text-white",
];

export default async function AdminDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalOrders,
    deliveredOrders,
    returnedOrders,
    shippedOrders,
    monthlyOrders,
    todayOrders,
    monthlyRevAgg,
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
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.order.aggregate({
      where: { status: "DELIVERED", createdAt: { gte: startOfMonth } },
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
    const sp = Number(order.product?.sellerPrice ?? 0);
    const cp = Number(order.product?.costPrice ?? 0);
    return acc + (sp - cp) * order.quantity;
  }, 0);

  const walletBalance = Number(walletAgg._sum.balance ?? 0);
  const monthlyRev = Number(monthlyRevAgg._sum.codAmount ?? 0);

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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#1E293B]">لوحة التحكم الرئيسية</h1>
          <p className="text-slate-400 text-sm mt-0.5">نظرة عامة على أداء المنصة</p>
        </div>
        <div className="text-sm text-slate-500 font-medium bg-white px-4 py-2.5 rounded-xl border border-[#E2E8F0] shadow-sm w-fit">
          📅{" "}
          {now.toLocaleDateString("ar-MA", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "طلبات هذا الشهر",
            value: monthlyOrders.toLocaleString("ar-MA"),
            icon: "📦",
            bg: "#EEF2FF",
            color: "#4361EE",
          },
          {
            label: "إيرادات هذا الشهر",
            value: `${monthlyRev.toLocaleString("ar-MA", { maximumFractionDigits: 0 })} د.م`,
            icon: "💰",
            bg: "#ECFDF5",
            color: "#059669",
          },
          {
            label: "طلبات قيد الانتظار",
            value: pendingCount.toLocaleString("ar-MA"),
            icon: "⏳",
            bg: "#FFF7ED",
            color: "#EA580C",
          },
          {
            label: "معدل الإرجاع",
            value: `${returnRate}%`,
            icon: "↩️",
            bg: "#FEF2F2",
            color: "#DC2626",
          },
        ].map(({ label, value, icon, bg, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: bg }}
            >
              {icon}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold leading-tight">{label}</p>
              <p className="text-xl font-black mt-0.5" style={{ color }}>
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Platform Profit */}
        <div className="bg-gradient-to-br from-[#4361EE] to-[#3254D4] p-6 rounded-2xl text-white shadow-lg shadow-blue-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-8 -translate-y-8" />
          <div className="relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl mb-4">
              💹
            </div>
            <p className="text-blue-100 text-xs font-bold mb-1">ربح المنصة المتوقع</p>
            <h3 className="text-2xl font-black">
              {platformProfit.toLocaleString("ar-MA", { maximumFractionDigits: 0 })}{" "}
              <span className="text-base font-bold opacity-80">د.م</span>
            </h3>
            <p className="text-[10px] text-blue-200 mt-3">
              الفرق بين سعر المورد وسعر البائع
            </p>
          </div>
        </div>

        {/* Delivery Rate */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl mb-4">
            ✅
          </div>
          <p className="text-slate-400 text-xs font-bold mb-1">نسبة نجاح التوصيل</p>
          <h3 className="text-2xl font-black text-green-600">{deliveryRate}%</h3>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-green-500 h-full rounded-full transition-all"
              style={{ width: `${deliveryRate}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {deliveredOrders.toLocaleString("ar-MA")} تسليم من{" "}
            {(deliveredOrders + returnedOrders).toLocaleString("ar-MA")}
          </p>
        </div>

        {/* Today's Orders */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-xl mb-4">
            🔥
          </div>
          <p className="text-slate-400 text-xs font-bold mb-1">طلبات اليوم</p>
          <h3 className="text-2xl font-black text-[#FB923C]">
            {todayOrders.toLocaleString("ar-MA")}
          </h3>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#FB923C] h-full rounded-full transition-all"
              style={{
                width: `${totalOrders > 0 ? Math.min((todayOrders / Math.max(monthlyOrders, 1)) * 30 * 100, 100) : 0}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            من إجمالي {totalOrders.toLocaleString("ar-MA")} طلب
          </p>
        </div>

        {/* Active Sellers */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-xl mb-4">
            👥
          </div>
          <p className="text-slate-400 text-xs font-bold mb-1">البائعون النشطون</p>
          <h3 className="text-2xl font-black text-[#1E293B]">
            {activeSellers.toLocaleString("ar-MA")}
          </h3>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-purple-400 h-full rounded-full" style={{ width: "70%" }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            سيولة المحافظ: {walletBalance.toLocaleString("ar-MA", { maximumFractionDigits: 0 })} د.م
          </p>
        </div>
      </div>

      {/* Status Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusBox title="إجمالي الطلبات" value={totalOrders} icon="📊" bg="#EEF2FF" fg="#4361EE" />
        <StatusBox title="في الطريق" value={shippedOrders} icon="🚚" bg="#FFFBEB" fg="#B45309" />
        <StatusBox title="تم التسليم" value={deliveredOrders} icon="✅" bg="#ECFDF5" fg="#065F46" />
        <StatusBox title="مرتجعات" value={returnedOrders} icon="↩️" bg="#FEF2F2" fg="#991B1B" />
      </div>

      {/* Activity Table + Top Sellers */}
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
                  <div className="w-7 text-center text-xl flex-shrink-0">
                    {idx < 3 ? (
                      MEDALS[idx]
                    ) : (
                      <span className="text-xs font-black text-slate-400 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100">
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

function StatusBox({
  title,
  value,
  icon,
  bg,
  fg,
}: {
  title: string;
  value: number;
  icon: string;
  bg: string;
  fg: string;
}) {
  return (
    <div
      className="p-5 rounded-2xl border border-black/5 shadow-sm"
      style={{ background: bg }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold" style={{ color: fg, opacity: 0.7 }}>
          {title}
        </p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-3xl font-black" style={{ color: fg }}>
        {value.toLocaleString("ar-MA")}
      </p>
    </div>
  );
}
