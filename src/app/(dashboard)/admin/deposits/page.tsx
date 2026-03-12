"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast"; // بما أننا أضفنا الإشعارات الجميلة

export default function AdminDepositsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    setLoading(true);
    axios.get("/api/admin/deposits").then(res => {
      setRequests(res.data.requests ||[]);
      setLoading(false);
    }).catch(() => {
      toast.error("فشل جلب الطلبات");
      setLoading(false);
    });
  };

  useEffect(() => { fetchRequests(); },[]);

  // دالة الموافقة
  const approveDeposit = async (id: string) => {
    if (!confirm("هل تأكدت من وصول المبلغ للحساب البنكي؟")) return;
    const toastId = toast.loading("جاري تنفيذ العملية...");
    try {
      await axios.post("/api/admin/deposits/approve", { id });
      toast.success("تم شحن رصيد البائع بنجاح! ✅", { id: toastId });
      fetchRequests(); // تحديث القائمة
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ", { id: toastId });
    }
  };

  // 👈 الدالة التي كانت مفقودة (دالة الرفض)
  const handleReject = async (id: string) => {
    if (!confirm("هل أنت متأكد من رفض طلب الشحن هذا؟ (مثلاً: الوصل مزور أو غير واضح)")) return;
    const toastId = toast.loading("جاري الرفض...");
    try {
      await axios.post("/api/admin/deposits/reject", { id });
      toast.success("تم رفض الطلب ❌", { id: toastId });
      fetchRequests(); // تحديث القائمة
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ", { id: toastId });
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-blue-600">جاري تحميل الطلبات...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">طلبات شحن المحفظة 💸</h2>
      
      {requests.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500">لا توجد طلبات شحن معلقة حالياً.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((req: any) => (
            <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              
              <div className="flex gap-6 items-center">
                {/* عرض صورة الوصل البنكي */}
                <div className="w-20 h-20 bg-gray-50 rounded-lg border flex items-center justify-center overflow-hidden hover:opacity-80 transition cursor-pointer">
                  {req.receiptImage ? (
                    <a href={req.receiptImage} target="_blank" rel="noreferrer" title="اضغط لتكبير الصورة">
                      <img src={req.receiptImage} alt="وصل الشحن" className="object-cover w-full h-full" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-gray-400 text-center px-2">بدون إثبات مصور</span>
                  )}
                </div>

                <div>
                  <p className="text-xl font-black text-green-600">{Number(req.amount).toFixed(2)} د.م</p>
                  <p className="text-sm font-bold text-gray-800">البائع: {req.seller.name}</p>
                  <p className="text-xs text-gray-400">تاريخ الطلب: {new Date(req.createdAt).toLocaleString('ar-MA')}</p>
                </div>
              </div>

              {/* أزرار التحكم */}
              <div className="flex gap-2 flex-col sm:flex-row">
                <button 
                  onClick={() => handleReject(req.id)}
                  className="bg-red-50 text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-100 transition"
                >
                  رفض ❌
                </button>
                <button 
                  onClick={() => approveDeposit(req.id)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow-lg transition"
                >
                  تأكيد وشحن ✅
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}