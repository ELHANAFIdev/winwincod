"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function SellerBatches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/seller/batches/list").then(res => {
      setBatches(res.data.batches);
      setLoading(false);
    });
  }, []);

  const handlePay = async (batchId: string) => {
    if (!confirm("هل تريد دفع تكلفة هذه الدفعة من محفظتك؟")) return;
    try {
      await axios.post("/api/seller/batches/pay", { batchId });
      alert("تم الدفع بنجاح! طلباتك قيد التجهيز الآن.");
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.error || "فشل الدفع");
    }
  };

  if (loading) return <div className="p-10 text-center">جاري تحميل الدفعات...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-xl font-bold mb-6">دفعاتي (Batches)</h1>
      <table className="w-full text-right">
        <thead>
          <tr className="bg-gray-50 text-sm">
            <th className="p-3">رقم الدفعة</th>
            <th className="p-3">تاريخ الإنشاء</th>
            <th className="p-3">المبلغ المطلوب</th>
            <th className="p-3">الحالة</th>
            <th className="p-3">الإجراء</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch: any) => (
            <tr key={batch.id} className="border-b">
              <td className="p-3 text-xs font-mono">{batch.id}</td>
              <td className="p-3">{new Date(batch.createdAt).toLocaleDateString()}</td>
              <td className="p-3 font-bold text-blue-600">{Number(batch.totalAmount).toFixed(2)} د.م</td>
              <td className="p-3">
                {batch.isPaid ? (
                  <span className="text-green-600 bg-green-50 px-2 py-1 rounded">تم الدفع</span>
                ) : (
                  <span className="text-red-600 bg-red-50 px-2 py-1 rounded">بانتظار الدفع</span>
                )}
              </td>
              <td className="p-3">
                {!batch.isPaid && Number(batch.totalAmount) > 0 && (
                  <button 
                    onClick={() => handlePay(batch.id)}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                  >
                    دفع الآن
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}