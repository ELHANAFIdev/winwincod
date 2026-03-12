"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  sellerPrice: number;
  stock: number;
  images: string;
  supplier: {
    name: string;
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/admin/products");
        setProducts(res.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-blue-600">جاري تحميل الكتالوج...</div>;

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-800">إدارة المنتجات 📦</h2>
          <p className="text-sm text-gray-500">إجمالي المنتجات في المستودع: {products.length}</p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition"
        >
          + إضافة منتج جديد
        </Link>
      </div>

      {/* قائمة المنتجات */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="p-4 border-b">المنتج</th>
              <th className="p-4 border-b">المورد</th>
              <th className="p-4 border-b">التكلفة / البيع</th>
              <th className="p-4 border-b text-center">المخزون</th>
              <th className="p-4 border-b">الحالة</th>
              <th className="p-4 border-b">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-400">لا توجد منتجات مضافة بعد.</td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                  {/* قسم الصورة والاسم */}
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                        {p.images ? (
                          <img src={p.images} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">📦</div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400 font-mono uppercase">{p.sku}</p>
                      </div>
                    </div>
                  </td>

                  {/* المورد */}
                  <td className="p-4 text-sm text-gray-600">
                    {p.supplier?.name || "غير محدد"}
                  </td>

                  {/* الأسعار */}
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="text-red-500">تكلفة: {Number(p.costPrice).toFixed(0)} د.م</p>
                      <p className="text-green-600 font-bold">بيع: {Number(p.sellerPrice).toFixed(0)} د.م</p>
                    </div>
                  </td>

                  {/* المخزون */}
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      p.stock > 10 ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                    }`}>
                      {p.stock} قطعة
                    </span>
                  </td>

                  {/* الحالة */}
                  <td className="p-4 text-sm">
                    {p.stock > 0 ? (
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                        نشط
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 font-medium">
                        <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                        منتهي
                      </span>
                    )}
                  </td>

                  {/* أزرار الإدارة */}
                 
<td className="p-4">
  <div className="flex gap-2">
    {/* زر التعديل */}
    <Link 
      href={`/admin/products/edit/${p.id}`} 
      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition"
    >
      ✏️
    </Link>

    {/* زر الحذف */}
    <button 
      onClick={async () => {
        if(confirm("هل أنت متأكد من حذف هذا المنتج نهائياً؟")) {
            try {
                await axios.delete(`/api/admin/products/${p.id}`);
                setProducts(products.filter(item => item.id !== p.id));
                alert("تم الحذف بنجاح");
            } catch (err) {
                alert("لا يمكن حذف المنتج لأنه مرتبط بطلبات سابقة");
            }
        }
      }}
      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
    >
      🗑️
    </button>
  </div>
</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}