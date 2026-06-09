"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function AdminDepositsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    setLoading(true);
    axios.get("/api/admin/deposits").then(res => {
      setRequests(res.data.requests || []);
      setLoading(false);
    }).catch(() => {
      toast.error("فشل جلب الطلبات");
      setLoading(false);
    });
  };

  useEffect(() => { fetchRequests(); }, []);

  const approveDeposit = async (id: string) => {
    if (!confirm("هل تأكدت من وصول المبلغ للحساب البنكي؟")) return;
    const tid = toast.loading("جاري تنفيذ العملية...");
    try {
      await axios.post("/api/admin/deposits/approve", { id });
      toast.success("تم شحن رصيد البائع بنجاح! ✅", { id: tid });
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ", { id: tid });
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("هل أنت متأكد من رفض طلب الشحن؟")) return;
    const tid = toast.loading("جاري الرفض...");
    try {
      await axios.post("/api/admin/deposits/reject", { id });
      toast.success("تم رفض الطلب", { id: tid });
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#1E293B]">طلبات شحن المحفظة</h2>
          <p className="text-slate-400 text-sm mt-0.5">مراجعة وتأكيد طلبات إضافة الرصيد</p>
        </div>
        <span className="bg-[#FB923C]/10 text-[#FB923C] font-bold text-sm px-4 py-2 rounded-xl border border-[#FB923C]/20">
          {requests.length} طلب معلق
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] p-16 text-center">
          <p className="text-4xl mb-3">💸</p>
          <p className="text-slate-400 font-bold">لا توجد طلبات شحن معلقة حالياً</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((req: any) => (
            <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col md:flex-row">
              {/* Blue left accent */}
              <div className="w-1.5 bg-[#4361EE] flex-shrink-0 hidden md:block"></div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 flex-1">
                <div className="flex gap-5 items-center">
                  {/* Receipt thumbnail */}
                  <div className="w-20 h-20 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {req.receiptImage ? (
                      <a href={req.receiptImage} target="_blank" rel="noreferrer">
                        <img src={req.receiptImage} alt="وصل" className="object-cover w-full h-full hover:opacity-80 transition" />
                      </a>
                    ) : (
                      <span className="text-2xl">🧾</span>
                    )}
                  </div>

                  <div>
                    <p className="text-2xl font-black text-green-600">{Number(req.amount).toFixed(2)} <span className="text-base">د.م</span></p>
                    <p className="text-sm font-bold text-[#1E293B] mt-0.5">👤 {req.seller.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(req.createdAt).toLocaleString("ar-MA")}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleReject(req.id)}
                    className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100 transition border border-red-100"
                  >
                    رفض ❌
                  </button>
                  <button
                    onClick={() => approveDeposit(req.id)}
                    className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition shadow-sm"
                  >
                    تأكيد وشحن ✅
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
