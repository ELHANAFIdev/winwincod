"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type Order = { id: string; customerName: string; city: string; productName: string; codAmount: number; createdAt: string; };

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Order[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => { fetchDrafts(); }, []);

  const fetchDrafts = async () => {
    try {
      const res = await axios.get("/api/seller/orders/drafts");
      setDrafts(res.data.drafts);
    } catch { console.error("Error fetching drafts"); } finally { setLoading(false); }
  };

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === drafts.length ? [] : drafts.map(d => d.id));

  const handleCreateBatch = async () => {
    if (selectedIds.length < 5) return;
    if (!confirm(`هل أنت متأكد من إرسال ${selectedIds.length} طلبات للمعالجة؟`)) return;
    setSubmitting(true);
    try {
      await axios.post("/api/seller/batches/create", { orderIds: selectedIds });
      router.push("/seller/batches");
    } catch (error: any) {
      alert(error.response?.data?.error || "حدث خطأ");
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#4361EE] border-t-transparent"></div>
      <span className="mr-3 text-[#4361EE] font-bold">جاري تحميل المسودات...</span>
    </div>
  );

  const canBatch = selectedIds.length >= 5;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#1E293B]">مسودة الطلبات</h2>
          <p className="text-slate-400 text-sm mt-0.5">اختر 5 طلبات أو أكثر لإنشاء دفعة</p>
        </div>
        <button
          onClick={handleCreateBatch}
          disabled={!canBatch || submitting}
          className={`px-6 py-2.5 rounded-xl font-bold transition text-sm ${
            canBatch ? "bg-[#4361EE] hover:bg-[#3254D4] text-white shadow-sm" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {submitting ? "جاري الإرسال..." : `إرسال الدفعة (${selectedIds.length})`}
        </button>
      </div>

      {selectedIds.length > 0 && selectedIds.length < 5 && (
        <div className="bg-[#FB923C]/10 border border-[#FB923C]/20 rounded-xl px-4 py-3 text-sm text-[#FB923C] font-bold">
          ⚠️ يجب اختيار 5 طلبات على الأقل — اخترت {selectedIds.length}
        </div>
      )}

      {drafts.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] p-16 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-slate-400 font-bold">لا توجد مسودات حالياً</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-slate-500 font-bold">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === drafts.length && drafts.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-[#4361EE] rounded"
                  />
                </th>
                <th className="p-4">الزبون</th>
                <th className="p-4">المدينة</th>
                <th className="p-4">المنتج</th>
                <th className="p-4">مبلغ COD</th>
                <th className="p-4">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map(order => (
                <tr
                  key={order.id}
                  onClick={() => toggleSelect(order.id)}
                  className={`border-b border-[#E2E8F0] cursor-pointer transition ${
                    selectedIds.includes(order.id) ? "bg-[#EEF2FF]" : "hover:bg-[#F8FAFC]"
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(order.id)}
                      onChange={() => toggleSelect(order.id)}
                      onClick={e => e.stopPropagation()}
                      className="w-4 h-4 accent-[#4361EE] rounded"
                    />
                  </td>
                  <td className="p-4 font-bold text-[#1E293B]">{order.customerName}</td>
                  <td className="p-4 text-slate-500">{order.city}</td>
                  <td className="p-4 text-slate-600">{order.productName}</td>
                  <td className="p-4 font-bold text-green-600">{Number(order.codAmount).toFixed(2)} د.م</td>
                  <td className="p-4 text-slate-400">{new Date(order.createdAt).toLocaleDateString("ar-MA")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
