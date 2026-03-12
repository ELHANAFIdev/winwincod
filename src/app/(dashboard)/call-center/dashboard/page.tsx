"use client";

import { useEffect, useState } from "react";
import axios from "axios";

// نوع البيانات للعرض
type OrderTask = {
  id: string;
  customerName: string;
  customerPhone: string;
  city: string;
  productName: string;
  quantity: number;
  codAmount: number;
  seller: { name: string };
  createdAt: string;
};

export default function CallCenterDashboard() {
  const [orders, setOrders] = useState<OrderTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

const fetchOrders = async () => {
  try {
    const res = await axios.get("/api/call-center/orders");
    console.log("Orders received:", res.data.orders); // 👈 أضف هذا السطر للفحص في الكونسول (F12)
    setOrders(res.data.orders);
  } catch (error) {
    console.error("Failed to fetch tasks");
  } finally {
    setLoading(false);
  }
};

  // دالة تغيير الحالة
  const updateStatus = async (orderId: string, status: 'CONFIRMED' | 'CANCELLED' | 'RETURNED') => {
    if(!confirm(status === 'CONFIRMED' ? "تأكيد الطلب؟" : "إلغاء الطلب؟")) return;

    setProcessingId(orderId);
    try {
      await axios.post("/api/call-center/update-status", {
        orderId,
        status,
        notes: "تم التعامل من لوحة الكول سنتر"
      });
      
      // إزالة الطلب من القائمة بعد معالجته
      setOrders(prev => prev.filter(o => o.id !== orderId));
      
    } catch (error) {
      alert("حدث خطأ أثناء التحديث");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="text-center p-10">جاري تحميل المهام... ⏳</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        قائمة الانتظار ({orders.length})
      </h2>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-xl text-center shadow-sm">
          <p className="text-gray-500 text-lg">🎉 لا توجد طلبات معلقة حالياً. عمل رائع!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition">
              
              {/* تفاصيل الطلب */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-800">{order.customerName}</h3>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                    {order.city}
                  </span>
                </div>
                <div className="text-2xl font-mono text-blue-600 font-bold tracking-wider">
                  {order.customerPhone}
                </div>
                <p className="text-sm text-gray-500">
                  المنتج: <span className="font-medium text-gray-800">{order.productName} ({order.quantity})</span>
                   | السعر: <span className="font-medium text-green-600">{Number(order.codAmount).toFixed(2)} د.م</span>
                </p>
                <p className="text-xs text-gray-400">
                  البائع: {order.seller.name} | منذ: {new Date(order.createdAt).toLocaleDateString('ar-MA')}
                </p>
              </div>

              {/* أزرار التحكم */}
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => updateStatus(order.id, 'CANCELLED')}
                  disabled={processingId === order.id}
                  className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition disabled:opacity-50"
                >
                  ❌ إلغاء
                </button>
                <button
                  onClick={() => updateStatus(order.id, 'CONFIRMED')}
                  disabled={processingId === order.id}
                  className="flex-1 md:flex-none px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-lg transition disabled:opacity-50"
                >
                  ✅ تأكيد
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}