"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // For uploading receipt
  const [activeRequest, setActiveRequest] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState("");

  const fetchRequests = () => {
    setLoading(true);
    axios.get("/api/admin/withdrawals").then(res => {
      setRequests(res.data.requests || []);
      setLoading(false);
    }).catch(() => {
      toast.error("فشل جلب الطلبات");
      setLoading(false);
    });
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    if (action === 'APPROVE' && !receiptUrl && id === activeRequest) {
      toast.error("الرجاء إرفاق رابط الوصل البنكي للتأكيد!");
      return;
    }
    if (action === 'REJECT') {
      if (!confirm("هل أنت متأكد من رفض السحب وسيتم استرجاع المبلغ لمحفظة البائع؟")) return;
    }

    const toastId = toast.loading("جاري تنفيذ العملية...");
    try {
      await axios.post("/api/admin/withdrawals/action", { 
        id, 
        action,
        receiptUrl: action === 'APPROVE' ? receiptUrl : undefined
      });
      toast.success(`تم ${action === 'APPROVE' ? 'تأكيد السحب بنجاح' : 'رفض الطلب ❌'}`, { id: toastId });
      setActiveRequest(null);
      setReceiptUrl("");
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ غير متوقع", { id: toastId });
    }
  };

  if (loading) return <div className="p-16 text-center text-xl font-black text-gray-400">جاري تحميل الطلبات...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-800">سحوبات الأرباح 💳</h2>
          <p className="text-gray-500 mt-2 font-medium">مراجعة وتحويل المستحقات إلى الحسابات البنكية للبائعين</p>
        </div>
      </div>
      
      {requests.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-3xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-lg font-bold">لا توجد طلبات سحب في الانتظار حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((req: any) => (
            <div key={req.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden hover:shadow-md transition">
              <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-b from-green-500 to-green-400"></div>
              
              <div className="flex-1 w-full pl-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-black text-green-600 mb-1">{Number(req.amount).toFixed(2)} د.م</h3>
                    <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                       👤 {req.seller.name} 
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{req.seller.email}</span>
                    </p>
                  </div>
                  <div className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                    {new Date(req.createdAt).toLocaleString('ar-MA')}
                  </div>
                </div>

                <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100/50 flex flex-col xl:flex-row gap-6 w-full">
                  <div>
                     <p className="text-xs font-bold text-gray-400 mb-1.5">البنك</p>
                     <p className="font-black text-gray-800">{req.seller.bankName || "لم يُِدخل بيانات البنك"}</p>
                  </div>
                  <div>
                     <p className="text-xs font-bold text-gray-400 mb-1.5">الاسم المتطابق</p>
                     <p className="font-black text-gray-800">{req.seller.bankAccountName || "---"}</p>
                  </div>
                  <div>
                     <p className="text-xs font-bold text-gray-400 mb-1.5">الـ RIB (للتحويل)</p>
                     <p className="font-mono font-bold tracking-widest text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm">
                       {req.seller.rib || "لم يُدخل الـ RIB!"}
                     </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-72 mt-6 md:mt-0 flex-shrink-0">
                {activeRequest === req.id ? (
                  <div className="bg-gray-50 p-4 rounded-xl border border-green-200 space-y-4 animate-fade-in shadow-inner">
                    <label className="text-xs font-black text-gray-600 block">إرفاق رابط صورة الوصل (رابط URL)</label>
                    <input 
                      type="url" 
                      placeholder="https://..." 
                      className="w-full text-sm border-2 border-gray-200 focus:border-green-500 p-3 rounded-xl outline-none transition"
                      value={receiptUrl}
                      onChange={e => setReceiptUrl(e.target.value)}
                      required
                    />
                    <div className="flex gap-2">
                       <button onClick={() => handleAction(req.id, 'APPROVE')} className="flex-1 bg-green-600 text-white text-sm py-3 rounded-xl font-bold hover:bg-green-700 shadow-md shadow-green-200 transition">دفع الآن</button>
                       <button onClick={() => setActiveRequest(null)} className="flex-1 bg-gray-200 text-gray-700 text-sm py-3 rounded-xl font-bold hover:bg-gray-300 transition">رجوع</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => setActiveRequest(req.id)}
                      className="w-full bg-green-600 text-white py-3.5 rounded-xl font-black shadow-lg shadow-green-100 hover:bg-green-700 hover:-translate-y-0.5 transition transform flex justify-center items-center gap-2"
                    >
                      إرفاق الوصل وتأكيد ✅
                    </button>
                    <button 
                      onClick={() => handleAction(req.id, 'REJECT')}
                      className="w-full bg-red-50 text-red-600 py-3.5 rounded-xl font-black hover:bg-red-100 transition"
                    >
                      إلغاء الطلب ❌
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
