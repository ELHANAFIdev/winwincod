"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ui/ImageUpload";
import { Package, Lock, CheckCircle } from "lucide-react";

const inputCls = "w-full border border-gray-200 focus:border-[#4361EE] p-3 rounded-xl outline-none transition bg-white text-[#1E293B]";
const labelCls = "block text-sm font-bold text-[#1E293B] mb-2";

export default function NewProductPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", sku: "", supplierId: "", costPrice: "", sellerPrice: "", marketPrice: "", stock: "", images: "",
  });

  useEffect(() => {
    axios.get("/api/admin/suppliers").then(res => setSuppliers(res.data.suppliers));
  }, []);

  const set = (key: string, val: string) => setFormData(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/admin/products", formData);
      alert("تمت إضافة المنتج للمستودع بنجاح!");
      router.push("/admin/products");
    } catch {
      alert("فشل الحفظ: تأكد من تعبئة جميع الحقول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#1E293B]">إضافة منتج جديد</h2>
        <p className="text-slate-400 text-sm mt-0.5">أضف منتجاً جديداً للمستودع</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Basic info */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 space-y-5">
          <h3 className="font-bold text-[#1E293B] text-sm border-b border-[#E2E8F0] pb-3">المعلومات الأساسية</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelCls}>اسم المنتج</label>
              <input className={inputCls} placeholder="مثلاً: ساعة رجالية فاخرة..." value={formData.name} onChange={e => set("name", e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>المورد</label>
              <select className={inputCls + " bg-white"} value={formData.supplierId} onChange={e => set("supplierId", e.target.value)} required>
                <option value="">-- اختر المورد --</option>
                {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>رمز المنتج (SKU)</label>
              <input className={inputCls + " font-mono"} placeholder="PROD-001" value={formData.sku} onChange={e => set("sku", e.target.value)} required />
            </div>
          </div>
        </div>

        {/* Section 2: Stock & market price */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 space-y-5">
          <h3 className="font-bold text-[#1E293B] text-sm border-b border-[#E2E8F0] pb-3">الكمية والسعر</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}><span className="flex items-center gap-1">الكمية المتوفرة (Stock) <Package className="w-4 h-4 inline" /></span></label>
              <input type="number" min="0" className={inputCls} placeholder="0" value={formData.stock} onChange={e => set("stock", e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>سعر السوق المقترح</label>
              <input type="number" min="0" className={inputCls} placeholder="299.00" value={formData.marketPrice} onChange={e => set("marketPrice", e.target.value)} required />
              <p className="text-xs text-slate-400 mt-1">سيظهر مشطوباً للبائع كمحفز</p>
            </div>
          </div>
        </div>

        {/* Section 3: Sensitive prices */}
        <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-6 space-y-5">
          <h3 className="font-bold text-[#1E293B] text-sm border-b border-[#E2E8F0] pb-3 flex items-center gap-1">الأسعار الداخلية <Lock className="w-4 h-4" /></h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-red-600 mb-2">سعر التكلفة (من المورد)</label>
              <input type="number" className="w-full border border-red-200 focus:border-red-400 p-3 rounded-xl outline-none bg-white" placeholder="ما تدفعه للمورد" value={formData.costPrice} onChange={e => set("costPrice", e.target.value)} required />
              <p className="text-xs text-red-400 mt-1">سري — لا يراه البائع</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-green-700 mb-2">سعر البيع للبائع</label>
              <input type="number" className="w-full border border-green-200 focus:border-green-500 p-3 rounded-xl outline-none bg-white" placeholder="ما يدفعه البائع" value={formData.sellerPrice} onChange={e => set("sellerPrice", e.target.value)} required />
              <p className="text-xs text-green-600 mt-1">يُخصم من محفظة البائع</p>
            </div>
          </div>
        </div>

        {/* Section 4: Image */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 space-y-3">
          <label className={labelCls}>صورة المنتج</label>
          <ImageUpload value={formData.images} onSuccess={url => set("images", url)} />
        </div>

        <button
          disabled={loading}
          className="w-full bg-[#4361EE] hover:bg-[#3254D4] text-white py-4 rounded-xl font-bold transition shadow-sm text-base disabled:opacity-60"
        >
          {loading ? "جاري الحفظ..." : <span className="flex items-center justify-center gap-1">حفظ وإضافة للمستودع <CheckCircle className="w-4 h-4" /></span>}
        </button>
      </form>
    </div>
  );
}
