"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

export default function SellerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/seller/analytics").then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-10 text-center text-blue-600">جاري تحميل البيانات... 📊</div>;

  // ألوان الرسم الدائري
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-gray-800">لوحة القيادة 🚀</h2>
        <div className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold">
          إجمالي الطلبات: {data.totalOrders}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. رسم بياني: الطلبات اليومية (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
          <h3 className="font-bold text-gray-700 mb-6">نشاط الأسبوع الحالي 📅</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data.barData}>
              <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <Tooltip 
                cursor={{fill: '#f3f4f6'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 2. رسم بياني: توزيع الحالات (Pie Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
          <h3 className="font-bold text-gray-700 mb-6">حالة الطلبات (نسبة التوصيل) 📦</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={data.pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.pieData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* بطاقات نصائح سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-purple-100 text-sm font-bold">نصيحة اليوم</p>
          <p className="mt-2 font-medium">الرد السريع على الهاتف يرفع نسبة التوصيل بـ 30%. تأكد من أرقام الزبائن!</p>
        </div>
        
        {/* يمكن إضافة المزيد هنا */}
      </div>
    </div>
  );
}