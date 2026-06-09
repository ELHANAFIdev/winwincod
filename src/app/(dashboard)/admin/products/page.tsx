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
  supplier: { name: string };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/admin/products")
      .then(res => setProducts(res.data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#4361EE] border-t-transparent"></div>
      <span className="mr-3 text-[#4361EE] font-bold">جاري تحميل الكتالوج...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#1E293B]">إدارة المنتجات</h2>
          <p className="text-slate-400 text-sm mt-0.5">إجمالي: {products.length} منتج في المستودع</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-[#4361EE] hover:bg-[#3254D4] text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm"
        >
          + إضافة منتج
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-slate-500 text-sm font-bold">
              <th className="p-4">المنتج</th>
              <th className="p-4">المورد</th>
              <th className="p-4">التكلفة / البيع</th>
              <th className="p-4 text-center">المخزون</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400">لا توجد منتجات مضافة بعد.</td>
              </tr>
            ) : (
              products.map(p => (
                <tr key={p.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] overflow-hidden flex-shrink-0">
                        {p.images
                          ? <img src={p.images} alt={p.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                        }
                      </div>
                      <div>
                        <p className="font-bold text-[#1E293B] text-sm">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">{p.sku}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-sm text-slate-500">{p.supplier?.name || "—"}</td>

                  <td className="p-4 text-sm">
                    <p className="text-red-500">تكلفة: {Number(p.costPrice).toFixed(0)} د.م</p>
                    <p className="text-green-600 font-bold">بيع: {Number(p.sellerPrice).toFixed(0)} د.م</p>
                  </td>

                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      p.stock > 10 ? "bg-blue-50 text-[#4361EE]" : "bg-red-50 text-red-600"
                    }`}>
                      {p.stock} قطعة
                    </span>
                  </td>

                  <td className="p-4">
                    {p.stock > 0 ? (
                      <span className="flex items-center gap-1.5 text-green-600 text-sm font-bold">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>نشط
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-500 text-sm font-bold">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>منتهي
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-1">
                      <Link href={`/admin/products/edit/${p.id}`} className="p-2 hover:bg-blue-50 text-[#4361EE] rounded-lg transition">✏️</Link>
                      <button
                        onClick={async () => {
                          if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
                            try {
                              await axios.delete(`/api/admin/products/${p.id}`);
                              setProducts(products.filter(item => item.id !== p.id));
                            } catch {
                              alert("لا يمكن حذف المنتج لأنه مرتبط بطلبات سابقة");
                            }
                          }
                        }}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition"
                      >🗑️</button>
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
