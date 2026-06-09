"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#4361EE', '#FB923C', '#10B981', '#F59E0B', '#8B5CF6'];

export default function SellerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/seller/analytics").then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#4361EE] font-bold text-lg">
      جاري تحميل البيانات... 📊
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-[#1E293B]">لوحة القيادة 🚀</h2>
        <div className="text-sm bg-[#EEF2FF] text-[#4361EE] px-4 py-2 rounded-lg font-bold border border-blue-100">
          إجمالي الطلبات: {data.totalOrders}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0] h-96">
          <h3 className="font-bold text-[#1E293B] mb-6">نشاط الأسبوع الحالي 📅</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data.barData}>
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: '#F8FAFC' }}
                contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontFamily: 'Cairo, sans-serif' }}
              />
              <Bar dataKey="orders" fill="#4361EE" radius={[6, 6, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0] h-96">
          <h3 className="font-bold text-[#1E293B] mb-6">حالة الطلبات (نسبة التوصيل) 📦</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={data.pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {data.pieData.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontFamily: 'Cairo, sans-serif' }} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontFamily: 'Cairo, sans-serif', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tips Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#4361EE] text-white p-6 rounded-2xl shadow-lg shadow-blue-200">
          <p className="text-blue-100 text-sm font-bold">نصيحة اليوم</p>
          <p className="mt-2 font-medium text-sm leading-relaxed">
            الرد السريع على الهاتف يرفع نسبة التوصيل بـ 30%. تأكد من أرقام الزبائن!
          </p>
        </div>
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm">
          <p className="text-slate-400 text-sm font-bold">إجمالي الطلبات</p>
          <p className="text-3xl font-black text-[#1E293B] mt-1">{data.totalOrders}</p>
        </div>
        <div className="bg-[#FB923C] text-white p-6 rounded-2xl shadow-lg shadow-orange-200">
          <p className="text-orange-100 text-sm font-bold">المحفظة</p>
          <p className="mt-2 font-medium text-sm">تحقق من رصيدك وتأكد من طلب سحب أرباحك في الوقت المناسب.</p>
        </div>
      </div>
    </div>
  );
}
