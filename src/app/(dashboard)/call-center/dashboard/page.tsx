"use client";
import { useEffect, useState } from "react";
import axios from "axios";

type OrderTask = {
  id: string; customerName: string; customerPhone: string;
  city: string; productName: string; quantity: number;
  codAmount: number; seller: { name: string }; createdAt: string;
};

export default function CallCenterDashboard() {
  const [orders, setOrders] = useState<OrderTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/call-center/orders");
      setOrders(res.data.orders);
    } catch { console.error("Failed to fetch tasks"); } finally { setLoading(false); }
  };

  const updateStatus = async (orderId: string, status: "CONFIRMED" | "CANCELLED" | "RETURNED") => {
    if (!confirm(status === "CONFIRMED" ? "تأكيد الطلب؟" : "إلغاء الطلب؟")) return;
    setProcessingId(orderId);
    try {
      await axios.post("/api/call-center/update-status", { orderId, status, notes: "تم التعامل من لوحة الكول سنتر" });
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch { alert("حدث خطأ أثناء التحديث"); } finally { setProcessingId(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#4361EE] border-t-transparent"></div>
      <span className="mr-3 text-[#4361EE] font-bold">جاري تحميل المهام...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#1E293B]">قائمة التأكيد 📞</h2>
          <p className="text-slate-400 text-sm mt-0.5">الطلبات بانتظار التواصل مع الزبائن</p>
        </div>
        <span className={`font-bold text-sm px-4 py-2 rounded-xl border ${
          orders.length > 0
            ? "bg-[#FB923C]/10 text-[#FB923C] border-[#FB923C]/20"
            : "bg-green-50 text-green-700 border-green-100"
        }`}>
          {orders.length > 0 ? `${orders.length} طلب في الانتظار` : "لا توجد مهام 🎉"}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] p-16 text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-[#1E293B] font-bold text-lg">لا توجد طلبات معلقة حالياً</p>
          <p className="text-slate-400 text-sm mt-1">عمل رائع! القائمة فارغة.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden hover:shadow-md transition">
              <div className="w-full h-1 bg-[#4361EE]"></div>
              <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                {/* Order info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-[#1E293B]">{order.customerName}</h3>
                    <span className="bg-[#F8FAFC] border border-[#E2E8F0] text-slate-500 text-xs px-2.5 py-1 rounded-lg font-bold">
                      {order.city}
                    </span>
                  </div>
                  <div className="text-2xl font-mono font-black text-[#4361EE] tracking-wider">
                    {order.customerPhone}
                  </div>
                  <p className="text-sm text-slate-500">
                    المنتج: <span className="font-bold text-[#1E293B]">{order.productName} ×{order.quantity}</span>
                    {" | "}
                    المبلغ: <span className="font-bold text-green-600">{Number(order.codAmount).toFixed(2)} د.م</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    البائع: {order.seller.name} · {new Date(order.createdAt).toLocaleDateString("ar-MA")}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={() => updateStatus(order.id, "CANCELLED")}
                    disabled={processingId === order.id}
                    className="flex-1 md:flex-none px-5 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition border border-red-100 disabled:opacity-50 text-sm"
                  >
                    ❌ إلغاء
                  </button>
                  <button
                    onClick={() => updateStatus(order.id, "CONFIRMED")}
                    disabled={processingId === order.id}
                    className="flex-1 md:flex-none px-7 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50 text-sm"
                  >
                    ✅ تأكيد
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
