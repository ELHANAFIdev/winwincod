"use client";
import { useState, useEffect, use } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ui/ImageUpload";
import { CheckCircle } from "lucide-react";

const inputCls = "w-full border border-gray-200 focus:border-[#4361EE] p-3 rounded-xl outline-none transition bg-white text-[#1E293B]";
const labelCls = "block text-sm font-bold text-[#1E293B] mb-2";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      axios.get("/api/admin/suppliers"),
      axios.get(`/api/admin/products/${id}`)
    ]).then(([suppliersRes, productRes]) => {
      setSuppliers(suppliersRes.data.suppliers);
      setFormData(productRes.data);
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/products/${id}`, formData);
      alert("تم تحديث المنتج بنجاح!");
      router.push("/admin/products");
    } catch {
      alert("حدث خطأ في التحديث");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#4361EE] border-t-transparent"></div>
      <span className="mr-3 text-[#4361EE] font-bold">جاري تحميل بيانات المنتج...</span>
    </div>
  );

  const set = (key: string, val: any) => setFormData((f: any) => ({ ...f, [key]: val }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#1E293B]">تعديل المنتج</h2>
        <p className="text-slate-400 text-sm mt-0.5">{formData.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 space-y-5">
          <h3 className="font-bold text-[#1E293B] text-sm border-b border-[#E2E8F0] pb-3">المعلومات الأساسية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelCls}>اسم المنتج</label>
              <input className={inputCls} value={formData.name} onChange={e => set("name", e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>المورد</label>
              <select className={inputCls + " bg-white"} value={formData.supplierId || ""} onChange={e => set("supplierId", e.target.value)}>
                <option value="">-- اختر المورد --</option>
                {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>رمز المنتج (SKU)</label>
              <input className={inputCls + " font-mono"} value={formData.sku || ""} onChange={e => set("sku", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 space-y-5">
          <h3 className="font-bold text-[#1E293B] text-sm border-b border-[#E2E8F0] pb-3">الكمية والأسعار</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-bold text-[#4361EE] mb-2">المخزون (Stock)</label>
              <input type="number" className="w-full border border-[#4361EE]/30 focus:border-[#4361EE] p-3 rounded-xl outline-none bg-white" value={formData.stock} onChange={e => set("stock", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-red-600 mb-2">سعر التكلفة</label>
              <input type="number" className="w-full border border-red-200 focus:border-red-400 p-3 rounded-xl outline-none bg-white" value={formData.costPrice} onChange={e => set("costPrice", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-green-700 mb-2">سعر البيع للبائع</label>
              <input type="number" className="w-full border border-green-200 focus:border-green-500 p-3 rounded-xl outline-none bg-white" value={formData.sellerPrice} onChange={e => set("sellerPrice", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 space-y-3">
          <label className={labelCls}>صورة المنتج</label>
          <ImageUpload value={formData.images} onSuccess={url => set("images", url)} />
        </div>

        <button className="w-full bg-[#4361EE] hover:bg-[#3254D4] text-white py-4 rounded-xl font-bold transition shadow-sm flex items-center justify-center gap-1">
          تحديث البيانات <CheckCircle className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
