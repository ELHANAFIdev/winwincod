"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import DateDropdown, { PERIOD_LABELS, rangeFor } from "@/components/ui/DateDropdown";

const COLORS = ["#4361EE", "#FB923C", "#10B981", "#F59E0B", "#8B5CF6"];

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
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-[#1E293B]">لوحة القيادة 🚀</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            إحصائيات · {periodLabel}
          </p>
        </div>
        <DateDropdown
          period={period}
          from={from}
          to={to}
          onChange={handleDateChange}
        />
      </div>

      {loading || !data ? (
        <div className="space-y-4">
          {/* Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white rounded-2xl border border-[#E2E8F0] animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-white rounded-2xl border border-[#E2E8F0] animate-pulse" />
            <div className="h-80 bg-white rounded-2xl border border-[#E2E8F0] animate-pulse" />
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-[#4361EE] text-white p-5 rounded-2xl shadow-lg shadow-blue-200">
              <p className="text-blue-100 text-xs font-bold mb-1">إجمالي الطلبات</p>
              <p className="text-3xl font-black">{data.totalOrders}</p>
              <p className="text-[10px] text-blue-200 mt-2">{periodLabel}</p>
            </div>
            <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm">
              <p className="text-slate-400 text-xs font-bold mb-1">تم التسليم</p>
              <p className="text-3xl font-black text-green-600">{data.delivered ?? 0}</p>
              <p className="text-[10px] text-slate-400 mt-2">
                نسبة {data.deliveryRate ?? "0"}%
              </p>
            </div>
            <div className="bg-[#FB923C] text-white p-5 rounded-2xl shadow-lg shadow-orange-200 col-span-2 sm:col-span-1">
              <p className="text-orange-100 text-xs font-bold mb-1">الربح الصافي</p>
              <p className="text-3xl font-black">
                {Number(data.totalProfit ?? 0).toLocaleString("ar-MA", { maximumFractionDigits: 0 })}
                <span className="text-lg font-bold opacity-80"> د.م</span>
              </p>
              <p className="text-[10px] text-orange-100 mt-2">من الطلبات المُسلَّمة</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0]">
              <h3 className="font-bold text-[#1E293B] mb-1">نشاط الطلبات 📅</h3>
              <p className="text-xs text-slate-400 mb-5">{periodLabel}</p>
              {data.barData?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.barData}>
                    <XAxis
                      dataKey="date"
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#F8FAFC" }}
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontFamily: "Cairo, sans-serif",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="orders" fill="#4361EE" radius={[6, 6, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex flex-col items-center justify-center text-slate-300">
                  <p className="text-4xl mb-2">📊</p>
                  <p className="text-sm font-bold">لا توجد بيانات</p>
                </div>
              )}
            </div>

            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0]">
              <h3 className="font-bold text-[#1E293B] mb-1">حالة الطلبات 📦</h3>
              <p className="text-xs text-slate-400 mb-5">توزيع الحالات في الفترة</p>
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
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data.pieData.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #E2E8F0",
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
                <div className="h-[220px] flex flex-col items-center justify-center text-slate-300">
                  <p className="text-4xl mb-2">📦</p>
                  <p className="text-sm font-bold">لا توجد بيانات</p>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-[#EEF2FF] border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-bold text-[#4361EE] text-sm mb-0.5">نصيحة</p>
              <p className="text-slate-500 text-sm leading-relaxed">
                الرد السريع على الهاتف يرفع نسبة التوصيل بـ 30%. تأكد من أرقام الزبائن قبل الإرسال!
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
