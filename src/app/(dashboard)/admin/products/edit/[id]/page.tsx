"use client";
import { useState, useEffect, use } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ui/ImageUpload";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    // جلب الموردين وبيانات المنتج معاً
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
      alert("تم تحديث المنتج بنجاح! ✨");
      router.push("/admin/products");
    } catch (err) { alert("حدث خطأ في التحديث"); }
  };

  if (loading) return <div className="p-10 text-center">جاري تحميل بيانات المنتج...</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6">تعديل المنتج: {formData.name}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <label className="block text-sm font-bold mb-1">اسم المنتج</label>
                <input className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            {/* ... باقي الحقول بنفس تنسيق صفحة الإضافة ... */}
            <div>
                <label className="block text-sm font-bold mb-1 text-blue-600">المخزون (Stock)</label>
                <input type="number" className="w-full border-2 border-blue-50 p-2 rounded" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
            </div>
            <div className="col-span-2">
                <label className="block text-sm font-bold mb-1">صورة المنتج</label>
                <ImageUpload value={formData.images} onSuccess={(url) => setFormData({...formData, images: url})} />
            </div>
        </div>
        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">تحديث البيانات ✅</button>
      </form>
    </div>
  );
}