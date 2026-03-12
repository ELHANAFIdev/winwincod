"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// تعريف نوع البيانات للطلب
type Order = {
  id: string;
  customerName: string;
  city: string;
  productName: string;
  codAmount: number;
  createdAt: string;
};

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Order[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const res = await axios.get("/api/seller/orders/drafts");
      setDrafts(res.data.drafts);
    } catch (error) {
      console.error("Error fetching drafts");
    } finally {
      setLoading(false);
    }
  };

  // التحكم في الاختيار (Checkbox)
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // إرسال الدفعة
  const handleCreateBatch = async () => {
    if (selectedIds.length < 5) return;
    
    if (!confirm(`هل أنت متأكد من إرسال ${selectedIds.length} طلبات للمعالجة؟`)) return;

    setSubmitting(true);
    try {
      await axios.post("/api/seller/batches/create", { orderIds: selectedIds });
      alert("تم إنشاء الدفعة وإرسالها للتأكيد بنجاح!");
      router.push("/seller/batches"); // سنبني هذه الصفحة لاحقاً
    } catch (error: any) {
      alert(error.response?.data?.error || "حدث خطأ ما");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">جاري تحميل المسودات...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">مسودة الطلبات (Drafts)</h1>
        
        {/* زر إنشاء الدفعة */}
        <button
          onClick={handleCreateBatch}
          disabled={selectedIds.length < 5 || submitting}
          className={`px-6 py-2 rounded-lg font-bold transition ${
            selectedIds.length >= 5 
              ? "bg-green-600 text-white hover:bg-green-700 shadow-lg" 
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {submitting ? "جاري الإرسال..." : `إرسال الدفعة (${selectedIds.length})`}
        </button>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          لا توجد مسودات حالياً. ابدأ بإضافة طلب جديد.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-3 border-b w-10">#</th>
                <th className="p-3 border-b">الزبون</th>
                <th className="p-3 border-b">المدينة</th>
                <th className="p-3 border-b">المنتج</th>
                <th className="p-3 border-b">مبلغ COD</th>
                <th className="p-3 border-b">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((order) => (
                <tr 
                  key={order.id} 
                  className={`border-b hover:bg-blue-50 cursor-pointer transition ${selectedIds.includes(order.id) ? 'bg-blue-50' : ''}`}
                  onClick={() => toggleSelect(order.id)}
                >
                  <td className="p-3">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(order.id)}
                      onChange={() => toggleSelect(order.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </td>
                  <td className="p-3 font-medium">{order.customerName}</td>
                  <td className="p-3">{order.city}</td>
                  <td className="p-3">{order.productName}</td>
                  <td className="p-3 font-bold text-green-600">{Number(order.codAmount).toFixed(2)}</td>
                  <td className="p-3 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('ar-MA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedIds.length > 0 && selectedIds.length < 5 && (
        <p className="mt-4 text-sm text-red-500 font-medium text-center">
          ⚠️ يجب اختيار 5 طلبات على الأقل لإنشاء دفعة (اخترت {selectedIds.length})
        </p>
      )}
    </div>
  );
}