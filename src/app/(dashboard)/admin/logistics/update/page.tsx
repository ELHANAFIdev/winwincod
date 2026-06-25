"use client";
import { useState } from "react";
import axios from "axios";
import { Search, CheckCircle, RotateCcw } from "lucide-react";

export default function UpdateStatusPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/api/admin/logistics/search", { query: searchTerm });
      setOrders(res.data.orders);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    if (!confirm(`تغيير الحالة إلى ${status === "DELIVERED" ? "تم التسليم" : "مرتجع"}؟`)) return;
    try {
      await axios.post("/api/admin/logistics/update-delivery", { orderId, status });
      setOrders(prev => prev.filter((o: any) => o.id !== orderId));
    } catch {
      alert("حدث خطأ");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#1E293B]">تحديث حالات التوصيل</h2>
        <p className="text-slate-400 text-sm mt-0.5">ابحث عن طلب وقم بتحديث حالته</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          className="flex-1 border border-gray-200 focus:border-[#4361EE] p-3.5 rounded-xl outline-none transition bg-white text-[#1E293B]"
          placeholder="ابحث برقم الهاتف أو اسم الزبون..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#4361EE] hover:bg-[#3254D4] text-white px-6 py-3.5 rounded-xl font-bold transition shadow-sm disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            </span>
          ) : <span className="flex items-center gap-1"><Search className="w-4 h-4" /> بحث</span>}
        </button>
      </form>

      {/* Results */}
      <div className="space-y-3">
        {orders.length === 0 && !loading && searchTerm && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center text-slate-400">
            لا توجد نتائج لـ "{searchTerm}"
          </div>
        )}
        {orders.map((order: any) => (
          <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-[#1E293B]">{order.customerName}</h3>
              <p className="text-slate-400 text-sm mt-0.5">{order.customerPhone}</p>
              <p className="text-[#4361EE] text-sm font-medium mt-1">{order.productName}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateStatus(order.id, "RETURNED")}
                className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-bold hover:bg-red-100 transition border border-red-100 text-sm"
              >
                <span className="flex items-center gap-1"><RotateCcw className="w-4 h-4" /> مرتجع</span>
              </button>
              <button
                onClick={() => updateStatus(order.id, "DELIVERED")}
                className="bg-green-50 text-green-700 px-4 py-2.5 rounded-xl font-bold hover:bg-green-100 transition border border-green-100 text-sm"
              >
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> تم التسليم</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
