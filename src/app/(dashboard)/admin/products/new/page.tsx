"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ui/ImageUpload";

export default function NewProductPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  
    
  
  // حالة النموذج (تمت إضافة stock و marketPrice)
  const [formData, setFormData] = useState({
    name: "", 
    sku: "", 
    supplierId: "", 
    costPrice: "", 
    sellerPrice: "", 
    marketPrice: "", 
    stock: ""  ,
    images: "",       
  });
  

  // جلب الموردين للقائمة المنسدلة
  useEffect(() => {
    axios.get("/api/admin/suppliers").then(res => setSuppliers(res.data.suppliers));
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      // إرسال البيانات للـ API
      await axios.post("/api/admin/products", formData);
      alert("تمت إضافة المنتج للمخزون بنجاح! ✅");
      router.push("/admin/products"); // العودة لصفحة المنتجات
    } catch (err: any) {
      alert("فشل الحفظ: تأكد من تعبئة جميع الحقول");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">إضافة منتج جديد للمستودع 📦</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* الصف الأول: الاسم والمورد */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold mb-2 text-gray-700">اسم المنتج</label>
                <input 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="مثلاً: ساعة رجالية فاخرة..."
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">المورد</label>
                <select 
                    className="w-full border border-gray-300 p-3 rounded-lg bg-white"
                    value={formData.supplierId}
                    onChange={e => setFormData({...formData, supplierId: e.target.value})}
                    required
                >
                    <option value="">-- اختر المورد --</option>
                    {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">رمز المنتج (SKU)</label>
                <input 
                    className="w-full border border-gray-300 p-3 rounded-lg font-mono" 
                    placeholder="PROD-001"
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                    required
                />
            </div>
        </div>

        <hr className="border-gray-100" />

        {/* الصف الثاني: الكمية وسعر السوق */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold mb-2 text-blue-800">الكمية المتوفرة (Stock) 📦</label>
                <input 
                    type="number"
                    min="0"
                    className="w-full border-2 border-blue-100 p-3 rounded-lg focus:border-blue-500 outline-none" 
                    placeholder="0"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                    required
                />
                <p className="text-xs text-gray-400 mt-1">العدد الموجود فعلياً في مخزنك.</p>
            </div>

            <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">سعر السوق المقترح (للزبون)</label>
                <input 
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 p-3 rounded-lg" 
                    placeholder="299.00"
                    value={formData.marketPrice}
                    onChange={e => setFormData({...formData, marketPrice: e.target.value})}
                    required
                />
                <p className="text-xs text-gray-400 mt-1">سيظهر هذا السعر مشطوباً للبائع كمحفز.</p>
            </div>
        </div>

        {/* الصف الثالث: الأسعار الحساسة (ملونة للتمييز) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
                <label className="block text-sm font-bold mb-2 text-red-700">سعر التكلفة (Cost Price)</label>
                <input 
                    type="number" 
                    className="w-full border border-red-200 p-3 rounded-lg focus:ring-red-500" 
                    placeholder="ما تدفعه للمورد"
                    value={formData.costPrice}
                    onChange={e => setFormData({...formData, costPrice: e.target.value})}
                    required 
                />
                <p className="text-xs text-red-400 mt-1">سري للغاية (لا يراه البائع).</p>
            </div>
            
            <div>
                <label className="block text-sm font-bold mb-2 text-green-700">سعر البيع للبائع (Seller Price)</label>
                <input 
                    type="number" 
                    className="w-full border border-green-200 p-3 rounded-lg focus:ring-green-500" 
                    placeholder="ما يدفعه البائع لك"
                    value={formData.sellerPrice}
                    onChange={e => setFormData({...formData, sellerPrice: e.target.value})}
                    required 
                />
                <p className="text-xs text-green-600 mt-1">هذا المبلغ سيخصم من محفظة البائع.</p>
            </div>
        </div>
        <div className="col-span-2 space-y-2">
  <label className="block text-sm font-bold text-gray-700">صورة المنتج الحقيقية</label>
  <ImageUpload 
    value={formData.images} 
    onSuccess={(url) => setFormData({...formData, images: url})} 
  />
</div>

        <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg text-lg"
        >
            {loading ? "جاري الحفظ..." : "حفظ وإضافة للمستودع ✅"}
        </button>

      </form>
    </div>
  );
}