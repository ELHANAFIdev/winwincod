"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AddToCatalogButton({ productId, isAlreadyAdded }: any) {
  const [added, setAdded] = useState(isAlreadyAdded);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdd = async () => {
    setLoading(true);
    try {
      await axios.post("/api/seller/catalog", { productId });
      setAdded(true);
      router.refresh(); // لتحديث البيانات في الصفحة
      alert("تمت الإضافة لقائمتك بنجاح! 🎉");
    } catch (err) {
      alert("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  if (added) {
    return (
      <button disabled className="bg-gray-100 text-gray-500 px-6 py-3 rounded-lg font-bold cursor-default border border-gray-200">
        ✅ مضاف لقائمتك
      </button>
    );
  }

  return (
    <button 
      onClick={handleAdd}
      disabled={loading}
      className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg transition"
    >
      {loading ? "جاري الإضافة..." : "➕ إضافة لمنتجاتي"}
    </button>
  );
}