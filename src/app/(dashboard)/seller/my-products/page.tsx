"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

export default function MyCatalogPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب القائمة من API الخطوة 2
    axios.get("/api/seller/catalog").then(res => {
      setItems(res.data.products);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-10">جاري تحميل منتجاتك...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">منتجاتي (قائمة العمل) 💼</h2>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">لم تضف أي منتج لقائمتك بعد.</p>
          <Link href="/seller/products" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
            تصفح السوق وأضف منتجات
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item: any) => (
            <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center">
              
              {/* صورة مصغرة */}
             <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
  {item.product.images ? (
    <img src={item.product.images} className="w-full h-full object-cover" />
  ) : (
    <div className="flex items-center justify-center h-full text-2xl">📦</div>
  )}
</div>

              {/* التفاصيل */}
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">{item.product.name}</h3>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>التكلفة: <strong className="text-blue-600">{Number(item.product.sellerPrice).toFixed(0)}</strong></span>
                    <span>السوق: <strong className="text-green-600">{Number(item.product.marketPrice).toFixed(0)}</strong></span>
                    <span>المخزون: {item.product.stock}</span>
                </div>
              </div>

              {/* الأزرار (أهم جزء) */}
              <div className="flex gap-3 w-full md:w-auto">
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm">
                   📥 تحميل الصور
                </button>
                <Link 
                    href={`/seller/orders/new?productId=${item.product.id}`}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md text-sm flex items-center justify-center"
                >
                   🚀 بيع الآن
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}