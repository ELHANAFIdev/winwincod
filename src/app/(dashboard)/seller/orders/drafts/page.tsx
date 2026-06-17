"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const SHIPPING_COST = 30;

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
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDrafts();
    fetchWallet();
  }, []);

  const fetchDrafts = async () => {
    try {
      const res = await axios.get("/api/seller/orders/drafts");
      setDrafts(res.data.drafts || []);
    } catch {
      toast.error("فشل تحميل المسودات");
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    try {
      const res = await axios.get("/api/seller/wallet");
      setWalletBalance(Number(res.data.wallet?.balance ?? 0));
    } catch {
      setWalletBalance(null);
    }
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const toggleAll = () =>
    setSelectedIds(
      selectedIds.length === drafts.length ? [] : drafts.map((d) => d.id)
    );

  const totalCost = selectedIds.length * SHIPPING_COST;
  const hasEnoughBalance = walletBalance !== null && walletBalance >= totalCost;

  const handleShip = async () => {
    setSubmitting(true);
    try {
      const res = await axios.post("/api/seller/orders/ship-all", {
        orderIds: selectedIds,
      });
      toast.success(res.data.message);
      setShowModal(false);
      setSelectedIds([]);
      await fetchDrafts();
      await fetchWallet();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#4361EE] border-t-transparent" />
        <span className="text-[#4361EE] font-bold">جاري التحميل...</span>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1E293B]">مسودة الطلبات</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            اختر الطلبات التي تريد إرسالها للشحن
          </p>
        </div>

        <div className="flex items-center gap-3">
          {walletBalance !== null && (
            <span className="text-sm font-bold text-slate-500 bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2 rounded-xl">
              المحفظة: {walletBalance.toFixed(2)} د.م
            </span>
          )}
          <button
            onClick={() => setShowModal(true)}
            disabled={selectedIds.length === 0}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition shadow-sm ${
              selectedIds.length > 0
                ? "bg-[#4361EE] hover:bg-[#3254D4] text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            إرسال للشحن ({selectedIds.length})
          </button>
        </div>
      </div>

      {/* Empty state */}
      {drafts.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] p-16 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-slate-400 font-bold">لا توجد مسودات حالياً</p>
          <p className="text-slate-400 text-sm mt-1">
            أضف طلبات من صفحة المنتجات
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-slate-500 font-bold">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === drafts.length && drafts.length > 0
                    }
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
              {drafts.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => toggleSelect(order.id)}
                  className={`border-b border-[#E2E8F0] cursor-pointer transition ${
                    selectedIds.includes(order.id)
                      ? "bg-[#EEF2FF]"
                      : "hover:bg-[#F8FAFC]"
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(order.id)}
                      onChange={() => toggleSelect(order.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 accent-[#4361EE] rounded"
                    />
                  </td>
                  <td className="p-4 font-bold text-[#1E293B]">
                    {order.customerName}
                  </td>
                  <td className="p-4 text-slate-500">{order.city}</td>
                  <td className="p-4 text-slate-600">{order.productName}</td>
                  <td className="p-4 font-bold text-green-600">
                    {Number(order.codAmount).toFixed(2)} د.م
                  </td>
                  <td className="p-4 text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString("ar-MA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div>
              <h3 className="text-xl font-black text-[#1E293B]">
                تأكيد إرسال الطلبات
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                سيتم خصم رسوم الشحن من محفظتك
              </p>
            </div>

            <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] divide-y divide-[#E2E8F0] text-sm">
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-slate-500">عدد الطلبات</span>
                <span className="font-black text-[#1E293B]">
                  {selectedIds.length}
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-3">
                <span className="text-slate-500">رسوم الشحن للطلب</span>
                <span className="font-bold text-slate-600">
                  {SHIPPING_COST} د.م
                </span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-[#EEF2FF] rounded-b-xl">
                <span className="font-bold text-[#4361EE]">
                  إجمالي المخصوم
                </span>
                <span className="font-black text-[#4361EE] text-lg">
                  {totalCost} د.م
                </span>
              </div>
            </div>

            {/* Balance check */}
            {walletBalance !== null && (
              <div
                className={`flex justify-between items-center px-4 py-3 rounded-xl text-sm font-bold ${
                  hasEnoughBalance
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-600 border border-red-100"
                }`}
              >
                <span>رصيد المحفظة</span>
                <span>{walletBalance.toFixed(2)} د.م</span>
              </div>
            )}

            {!hasEnoughBalance && walletBalance !== null && (
              <p className="text-red-500 text-sm font-bold text-center">
                رصيد غير كافٍ — يرجى شحن المحفظة أولاً
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl border border-[#E2E8F0] text-slate-600 font-bold hover:bg-[#F8FAFC] transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleShip}
                disabled={!hasEnoughBalance || submitting}
                className={`flex-1 py-3 rounded-xl font-bold transition ${
                  hasEnoughBalance && !submitting
                    ? "bg-[#4361EE] hover:bg-[#3254D4] text-white shadow-sm"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {submitting ? "جاري الإرسال..." : "تأكيد الإرسال"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
