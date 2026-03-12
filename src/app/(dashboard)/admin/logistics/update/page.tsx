"use client";
import { useState } from "react";
import axios from "axios";

export default function UpdateStatusPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // دالة البحث (يمكنك البحث بالاسم أو الهاتف)
  // ملاحظة: سنستخدم API بحث بسيط سنبنيه بالأسفل أو نستخدم الجلب المباشر
  const handleSearch = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
        // بحث مخصص (سنضيف الـ API الخاص به لاحقاً أو نستخدم هذا التبسيط)
        // للتبسيط الآن: سنبحث في الـ API العام وسنضيف شرط البحث في الذاكرة أو الخادم
        // الأفضل بناء API بحث سريع، لكن دعنا نستخدم خدعة بسيطة للآن
        const res = await axios.post("/api/admin/logistics/search", { query: searchTerm });
        setOrders(res.data.orders);
    } catch (err) {
        alert("لا توجد نتائج");
        setOrders([]);
    } finally {
        setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    if(!confirm(`تغيير الحالة إلى ${status === 'DELIVERED' ? 'تم التسليم' : 'مرتجع'}؟`)) return;
    try {
        await axios.post("/api/admin/logistics/update-delivery", { orderId, status });
        alert("تم التحديث بنجاح! ✅");
        // إزالة الطلب من القائمة
        setOrders(prev => prev.filter((o: any) => o.id !== orderId));
    } catch (err) {
        alert("حدث خطأ");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">تحديث حالات التوصيل 📡</h2>

      {/* شريط البحث */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input 
            className="flex-1 border p-3 rounded-lg text-lg" 
            placeholder="ابحث برقم الهاتف أو اسم الزبون..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-6 rounded-lg font-bold">بحث 🔍</button>
      </form>

      {/* النتائج */}
      <div className="space-y-4">
        {orders.map((order: any) => (
            <div key={order.id} className="bg-white p-4 rounded-lg shadow border flex justify-between items-center">
                <div>
                    <h3 className="font-bold">{order.customerName}</h3>
                    <p className="text-gray-500">{order.customerPhone}</p>
                    <p className="text-sm text-blue-600">{order.productName}</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => updateStatus(order.id, 'RETURNED')}
                        className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 font-bold"
                    >
                        ↩️ مرتجع
                    </button>
                    <button 
                        onClick={() => updateStatus(order.id, 'DELIVERED')}
                        className="bg-green-100 text-green-700 px-4 py-2 rounded hover:bg-green-200 font-bold"
                    >
                        ✅ تم التسليم
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}