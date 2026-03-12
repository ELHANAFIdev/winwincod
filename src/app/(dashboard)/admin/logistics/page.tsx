"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

export default function LogisticsPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. الدالة المسؤولة عن جلب الشحنات الجاهزة (كانت ناقصة عندك)
  const fetchReadyBatches = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/logistics/ready");
      if (res.data.success) {
        setBatches(res.data.batches);
      }
    } catch (err) {
      console.error("خطأ في جلب بيانات اللوجستيك:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. تشغيل الجلب عند فتح الصفحة
  useEffect(() => {
    fetchReadyBatches();
  }, []);

  // 3. دالة تحديث الحالة إلى "تم الشحن"
  const markAsShipped = async (batchId: string) => {
    if (!confirm("هل أنت متأكد من خروج هذه الشحنة من المستودع؟ سيتم إنقاص المخزون آلياً.")) return;
    
    try {
      const res = await axios.post("/api/admin/logistics/ship", { batchId });
      if (res.data.success) {
        alert("تم تحديث الحالة إلى (مشحون 🚚) بنجاح!");
        fetchReadyBatches(); // إعادة تحديث القائمة لإزالة الشحنة التي شُحنت
      }
    } catch (err) {
      alert("حدث خطأ أثناء تحديث حالة الشحن");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="mr-3 text-blue-600 font-bold">جاري فحص المستودع...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800">غرفة تجهيز الشحنات 📦🚚</h2>
        <div className="text-sm font-medium bg-green-100 text-green-700 px-4 py-2 rounded-full">
          دفعات جاهزة للتغليف: {batches.length}
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="bg-white p-20 text-center rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-lg italic">
            لا توجد شحنات مدفوعة حالياً. بمجرد أن يقوم البائع بالدفع، ستظهر هنا.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {batches.map((batch: any) => (
            <div 
              key={batch.id} 
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6"
            >
              {/* معلومات الدفعة */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-slate-900 text-white text-xs px-2 py-1 rounded font-mono">
                    ID: {batch.id.slice(-8).toUpperCase()}
                  </span>
                  <h3 className="font-bold text-lg text-gray-800">بواسطة: {batch.seller.name}</h3>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                  <p className="text-gray-500">عدد الطلبات: <span className="text-gray-900 font-bold">{batch.orders.length}</span></p>
                  <p className="text-gray-500">المبلغ المدفوع: <span className="text-green-600 font-bold">{Number(batch.totalAmount).toFixed(2)} د.م</span></p>
                  <p className="text-gray-500">تاريخ الدفع: <span className="text-gray-900">{new Date(batch.createdAt).toLocaleDateString('ar-MA')}</span></p>
                </div>
              </div>

              {/* أزرار التحكم */}
              <div className="flex gap-3 w-full md:w-auto">
                {/* زر المانيفست */}
                <Link 
                  href={`/admin/logistics/manifest/${batch.id}`} 
                  target="_blank"
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  📄 المانيفست
                </Link>

                {/* زر تأكيد الشحن */}
                <button 
                  onClick={() => markAsShipped(batch.id)}
                  className="flex-1 md:flex-none bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2"
                >
                  <span>🚚</span>
                  تم الشحن
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}