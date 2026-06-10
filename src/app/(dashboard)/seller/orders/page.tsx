import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import DateFilter from "@/app/(dashboard)/admin/dashboard/DateFilter";

export const dynamic = "force-dynamic";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  DELIVERED:  { label: "تم التسليم",   cls: "bg-green-50 text-green-700 border border-green-100" },
  RETURNED:   { label: "مرتجع",        cls: "bg-red-50 text-red-600 border border-red-100" },
  SHIPPED:    { label: "في الطريق",    cls: "bg-blue-50 text-[#4361EE] border border-blue-100" },
  DRAFT:      { label: "مسودة",        cls: "bg-gray-100 text-gray-500" },
  CONFIRMED:  { label: "مؤكد",         cls: "bg-[#EEF2FF] text-[#4361EE] border border-blue-100" },
  PROCESSING: { label: "قيد التجهيز",  cls: "bg-orange-50 text-[#FB923C] border border-orange-100" },
  CANCELLED:  { label: "ملغي",         cls: "bg-gray-100 text-gray-500" },
};

const PERIOD_LABELS: Record<string, string> = {
  today:  "اليوم",
  week:   "هذا الأسبوع",
  month:  "هذا الشهر",
  year:   "هذه السنة",
  custom: "الفترة المخصصة",
};

type SearchParams = Promise<{ period?: string; from?: string; to?: string }>;

export default async function SellerOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SELLER") redirect("/login");

  const params = await searchParams;
  const period = params.period ?? "month";
  const periodLabel = PERIOD_LABELS[period] ?? "هذا الشهر";

  // Compute date range server-side
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  let periodFrom: Date;
  let periodTo: Date;
  let fromStr: string;
  let toStr: string;

  if (period === "custom" && params.from && params.to) {
    fromStr = params.from;
    toStr   = params.to;
  } else if (period === "today") {
    fromStr = toStr = todayStr;
  } else if (period === "week") {
    const day  = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const mon  = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
    fromStr = mon.toISOString().slice(0, 10);
    toStr   = todayStr;
  } else if (period === "year") {
    fromStr = `${now.getFullYear()}-01-01`;
    toStr   = todayStr;
  } else {
    // month
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    fromStr = `${now.getFullYear()}-${mm}-01`;
    toStr   = todayStr;
  }

  periodFrom = new Date(`${fromStr}T00:00:00.000Z`);
  periodTo   = new Date(`${toStr}T23:59:59.999Z`);

  const dateFilter = { createdAt: { gte: periodFrom, lte: periodTo } };

  const sellerId = session.user.id;

  const [orders, delivered, returned, profitAgg] = await Promise.all([
    prisma.order.findMany({
      where: { sellerId, ...dateFilter },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where: { sellerId, status: "DELIVERED", ...dateFilter } }),
    prisma.order.count({ where: { sellerId, status: "RETURNED",  ...dateFilter } }),
    prisma.order.aggregate({
      where: { sellerId, status: "DELIVERED", ...dateFilter },
      _sum: { netProfit: true },
    }),
  ]);

  const totalProfit = Number(profitAgg._sum.netProfit ?? 0);
  const deliveryRate = orders.length > 0
    ? Math.round((delivered / orders.length) * 100)
    : 0;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#1E293B]">طلباتي</h2>
          <p className="text-slate-400 text-sm mt-0.5">تابع حالة طلباتك وأرباحك</p>
        </div>
        <Link
          href="/seller/orders/new"
          className="bg-[#4361EE] hover:bg-[#3254D4] text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm text-sm"
        >
          + طلب جديد
        </Link>
      </div>

      {/* Date filter */}
      <Suspense fallback={<div className="h-14 bg-white rounded-2xl border border-[#E2E8F0] animate-pulse" />}>
        <DateFilter period={period} from={fromStr} to={toStr} />
      </Suspense>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: `طلبات ${periodLabel}`,   value: orders.length,                        sub: "إجمالي الطلبات",       color: "text-[#4361EE]" },
          { label: "تم التسليم",              value: delivered,                             sub: `نسبة ${deliveryRate}%`, color: "text-green-600" },
          { label: "مرتجع",                   value: returned,                              sub: "طلبات مرتجعة",         color: "text-red-500"   },
          { label: "الربح الصافي",            value: `${totalProfit.toFixed(2)} د.م`,       sub: "من الطلبات المسلمة",   color: "text-emerald-600" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
            <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-slate-500 font-bold">
              <th className="p-4">المنتج</th>
              <th className="p-4">الزبون / المدينة</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">COD</th>
              <th className="p-4">الربح الصافي</th>
              <th className="p-4">رقم التتبع</th>
              <th className="p-4">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const status = STATUS_MAP[o.status] || { label: o.status, cls: "bg-gray-100 text-gray-500" };
              return (
                <tr key={o.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition">
                  <td className="p-4 font-bold text-[#1E293B]">
                    {o.productName} <span className="text-slate-400 font-normal">×{o.quantity}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-[#1E293B]">{o.customerName}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{o.city}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${status.cls}`}>{status.label}</span>
                  </td>
                  <td className="p-4 font-bold text-[#1E293B]">
                    {Number(o.codAmount).toFixed(2)} <span className="text-slate-400 font-normal">د.م</span>
                  </td>
                  <td className="p-4 font-bold text-green-600">
                    {Number(o.netProfit).toFixed(2)} <span className="text-slate-400 font-normal">د.م</span>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-xs">{o.trackingNumber || "—"}</td>
                  <td className="p-4 text-slate-400">{new Date(o.createdAt).toLocaleDateString("ar-MA")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <p className="text-4xl mb-3">📦</p>
            لا توجد طلبات في هذه الفترة.
          </div>
        )}
      </div>
    </div>
  );
}
