"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function getRef(req: any) {
  const d = new Date(req.createdAt);
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const short = req.id.slice(-6).toUpperCase();
  return `WD-${ym}-${short}`;
}

export default function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState("");

  const fetchRequests = () => {
    setLoading(true);
    axios.get("/api/admin/withdrawals").then(res => {
      setRequests(res.data.requests || []);
      setLoading(false);
    }).catch(() => { toast.error("فشل جلب الطلبات"); setLoading(false); });
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    if (action === "APPROVE" && !receiptUrl) {
      toast.error("الرجاء إرفاق رابط الوصل البنكي!");
      return;
    }
    if (action === "REJECT" && !confirm("هل أنت متأكد؟ سيُسترجع المبلغ لمحفظة البائع.")) return;

    const tid = toast.loading("جاري تنفيذ العملية...");
    try {
      await axios.post("/api/admin/withdrawals/action", { id, action, receiptUrl: action === "APPROVE" ? receiptUrl : undefined });
      toast.success(action === "APPROVE" ? "تم تأكيد السحب ✅" : "تم رفض الطلب", { id: tid });
      setActiveRequest(null);
      setReceiptUrl("");
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ", { id: tid });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#4361EE] border-t-transparent"></div>
      <span className="mr-3 text-[#4361EE] font-bold">جاري تحميل الطلبات...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#1E293B]">سحوبات الأرباح</h2>
        <p className="text-slate-400 text-sm mt-0.5">مراجعة وتحويل المستحقات للحسابات البنكية</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] p-16 text-center">
          <p className="text-4xl mb-3">💳</p>
          <p className="text-slate-400 font-bold">لا توجد طلبات سحب في الانتظار</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {requests.map((req: any) => (
            <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
              <div className="w-full h-1 bg-[#4361EE]"></div>
              <div className="p-6 flex flex-col xl:flex-row gap-6">
                {/* Amount + seller info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <span className="inline-block font-mono font-black text-xs tracking-widest bg-[#1E293B] text-white px-3 py-1 rounded-lg mb-2">
                        {getRef(req)}
                      </span>
                      <p className="text-3xl font-black text-green-600">{Number(req.amount).toFixed(2)} <span className="text-xl">د.م</span></p>
                      <p className="text-sm font-bold text-[#1E293B] mt-1">👤 {req.seller.name}</p>
                      <p className="text-xs text-slate-400">{req.seller.email}</p>
                    </div>
                    <span className="text-xs text-slate-400 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-xl">
                      {new Date(req.createdAt).toLocaleString("ar-MA")}
                    </span>
                  </div>

                  {/* Bank details */}
                  <div className="bg-[#EEF2FF] rounded-xl p-4 border border-blue-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 mb-1">البنك</p>
                      <p className="font-black text-[#1E293B] text-sm">{req.seller.bankName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 mb-1">الاسم المتطابق</p>
                      <p className="font-black text-[#1E293B] text-sm">{req.seller.bankAccountName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 mb-1">الـ RIB</p>
                      <p className="font-mono font-bold text-[#4361EE] text-xs tracking-widest bg-white px-3 py-2 rounded-lg border border-blue-200">
                        {req.seller.rib || "لم يُدخل"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action area */}
                <div className="flex flex-col gap-3 xl:w-72 flex-shrink-0">
                  {activeRequest === req.id ? (
                    <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-3">
                      <label className="text-xs font-black text-[#1E293B] block">رابط صورة الوصل البنكي</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        className="w-full text-sm border border-gray-200 focus:border-[#4361EE] p-3 rounded-xl outline-none transition"
                        value={receiptUrl}
                        onChange={e => setReceiptUrl(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(req.id, "APPROVE")} className="flex-1 bg-green-600 text-white text-sm py-2.5 rounded-xl font-bold hover:bg-green-700 transition">
                          دفع الآن ✅
                        </button>
                        <button onClick={() => setActiveRequest(null)} className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] text-slate-600 text-sm py-2.5 rounded-xl font-bold hover:bg-gray-100 transition">
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setActiveRequest(req.id)}
                        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-sm"
                      >
                        إرفاق الوصل وتأكيد ✅
                      </button>
                      <button
                        onClick={() => handleAction(req.id, "REJECT")}
                        className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition border border-red-100"
                      >
                        إلغاء الطلب ❌
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
