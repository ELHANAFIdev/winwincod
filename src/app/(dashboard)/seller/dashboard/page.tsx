"use client";
import { useState, useEffect } from "react";
import { Package, CheckCircle, DollarSign, Lightbulb, TrendingUp, RotateCcw } from "lucide-react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import DateDropdown, { PERIOD_LABELS } from "@/components/ui/DateDropdown";

const COLORS = ["#4361EE", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const STATUS_AR: Record<string, string> = {
  DELIVERED: "تم التسليم",
  RETURNED: "مرتجع",
  SHIPPED: "في الطريق",
  PROCESSING: "قيد التجهيز",
  DRAFT: "مسودة",
  CONFIRMED: "مؤكد",
  CANCELLED: "ملغي",
  PENDING_CONFIRMATION: "بانتظار التأكيد",
  WAITING_PAYMENT: "بانتظار الدفع",
};

function getDefaultDates() {
  const now = new Date();
  return {
    period: "month",
    from: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
    to: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
  };
}

export default function SellerDashboard() {
  const defaults = getDefaultDates();
  const [period, setPeriod] = useState(defaults.period);
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/seller/analytics?from=${from}&to=${to}`)
      .then((res) => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [from, to]);

  const handleDateChange = (p: string, f: string, t: string) => {
    setPeriod(p);
    setFrom(f);
    setTo(t);
  };

  const periodLabel = PERIOD_LABELS[period] ?? "هذا الشهر";

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-slate-400 text-sm">{periodLabel}</p>
        </div>
        <DateDropdown period={period} from={from} to={to} onChange={handleDateChange} />
      </div>

      {loading || !data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            <div className="h-80 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          </div>
        </div>
      ) : (
        <>
          {/* ── Stats Cards ───────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

            {/* Total Orders */}
            <div className="bg-white border border-slate-100 border-t-4 border-t-[#4361EE] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 bg-[#EEF2FF] rounded-xl flex items-center justify-center mb-4">
                <Package className="w-5 h-5 text-[#4361EE]" />
              </div>
              <p className="text-2xl font-bold text-[#1E293B] mb-1">{data.totalOrders}</p>
              <p className="text-sm text-slate-500 font-medium">إجمالي الطلبات</p>
              <p className="text-[11px] text-slate-400 mt-1">{periodLabel}</p>
            </div>

            {/* Delivered */}
            <div className="bg-white border border-slate-100 border-t-4 border-t-[#10B981] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 bg-[#ECFDF5] rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
              </div>
              <p className="text-2xl font-bold text-[#10B981] mb-1">{data.delivered ?? 0}</p>
              <p className="text-sm text-slate-500 font-medium">تم التسليم</p>
              <p className="text-[11px] text-slate-400 mt-1">نسبة {data.deliveryRate ?? "0"}%</p>
            </div>

            {/* Net Profit */}
            <div className="bg-white border border-slate-100 border-t-4 border-t-[#FB923C] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 bg-[#FFF7ED] rounded-xl flex items-center justify-center mb-4">
                <DollarSign className="w-5 h-5 text-[#FB923C]" />
              </div>
              <p className="text-2xl font-bold text-[#FB923C] mb-1">
                {Number(data.totalProfit ?? 0).toLocaleString("ar-MA", { maximumFractionDigits: 0 })}
                <span className="text-base font-medium opacity-70 mr-1">د.م</span>
              </p>
              <p className="text-sm text-slate-500 font-medium">الربح الصافي</p>
              <p className="text-[11px] text-slate-400 mt-1">من الطلبات المُسلَّمة</p>
            </div>

            {/* Return Rate */}
            <div className="bg-white border border-slate-100 border-t-4 border-t-[#EF4444] rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="w-11 h-11 bg-[#FEF2F2] rounded-xl flex items-center justify-center mb-4">
                <RotateCcw className="w-5 h-5 text-[#EF4444]" />
              </div>
              <p className="text-2xl font-bold text-[#EF4444] mb-1">
                {(data.delivered + data.returned) > 0
                  ? Math.round((data.returned / (data.delivered + data.returned)) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-slate-500 font-medium">نسبة الإرجاع</p>
              <p className="text-[11px] text-slate-400 mt-1">{periodLabel}</p>
            </div>
          </div>

          {/* ── Charts ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-[#1E293B] text-base">نشاط الطلبات</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{periodLabel}</p>
                </div>
                <div className="w-9 h-9 bg-[#EEF2FF] rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4.5 h-4.5 text-[#4361EE]" />
                </div>
              </div>
              {data.barData?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.barData} barCategoryGap="30%">
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "#F8FAFC", radius: 8 }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                        fontFamily: "Cairo, sans-serif",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="orders" fill="#4361EE" radius={[8, 8, 0, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center">
                  <p className="text-sm font-medium text-slate-400">لا توجد بيانات</p>
                </div>
              )}
            </div>

            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-[#1E293B] text-base">حالة الطلبات</h3>
                  <p className="text-xs text-slate-400 mt-0.5">توزيع الحالات في الفترة</p>
                </div>
                <div className="w-9 h-9 bg-[#ECFDF5] rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-4.5 h-4.5 text-[#10B981]" />
                </div>
              </div>
              {data.pieData?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.pieData.map((d: any) => ({
                        ...d,
                        name: STATUS_AR[d.name] ?? d.name,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={82}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data.pieData.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                        fontFamily: "Cairo, sans-serif",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ fontFamily: "Cairo, sans-serif", fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center">
                  <p className="text-sm font-medium text-slate-400">لا توجد بيانات</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Tip Card ──────────────────────────────────────── */}
          <div className="bg-gradient-to-l from-[#4361EE]/5 to-[#4361EE]/10 border border-[#4361EE]/20 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-[#4361EE] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-[#4361EE] text-sm mb-1">نصيحة اليوم</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                الرد السريع على الهاتف يرفع نسبة التوصيل بـ 30%. تأكد من أرقام الزبائن قبل الإرسال!
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
