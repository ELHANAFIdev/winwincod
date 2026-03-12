"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  sku: string;
  sellerPrice: number;
  marketPrice: number;
  stock: number;
  images: string;
  description: string;
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/seller/products");
        setProducts(res.data.products);
      } catch (error) {
        console.error("Error fetching marketplace products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="mr-3 text-blue-600 font-bold">جاري تحميل السوق...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* رأس الصفحة */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800">سوق المنتجات 🏪</h1>
          <p className="text-gray-500 mt-1">تصفح المنتجات المتوفرة في المستودع وابدأ تجارتك الآن</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          <span className="text-blue-700 font-bold text-sm">إجمالي المنتجات: {products.length}</span>
        </div>
      </div>

      {/* شبكة المنتجات */}
      {products.length === 0 ? (
        <div className="bg-white p-20 text-center rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-lg">لا توجد منتجات متوفرة حالياً في المستودع.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              {/* قسم الصورة */}
              <div className="relative h-56 w-full bg-gray-50 overflow-hidden">
                {product.images ? (
                  <img 
                    src={product.images} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-gray-100 text-gray-300">
                    📦
                  </div>
                )}
                
                {/* شارة المخزون */}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm
                  ${product.stock > 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                  {product.stock > 0 ? `متوفر: ${product.stock}` : "نفذت الكمية"}
                </div>
              </div>

              {/* تفاصيل المنتج */}
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-2">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight truncate hover:text-blue-600 transition" title={product.name}>
                    {product.name}
                  </h3>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">SKU: {product.sku}</span>
                </div>

                <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
                  {product.description || "لا يوجد وصف متوفر لهذا المنتج حالياً."}
                </p>

                {/* قسم الأسعار */}
                <div className="bg-gray-50 rounded-xl p-3 mb-6 grid grid-cols-2 gap-2">
                  <div className="text-center border-l border-gray-200">
                    <p className="text-[10px] text-gray-400 font-bold mb-1">تكلفتك</p>
                    <p className="text-blue-700 font-black text-md">{Number(product.sellerPrice).toFixed(0)} <small className="text-[10px]">د.م</small></p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 font-bold mb-1">سعر السوق</p>
                    <p className="text-gray-400 font-bold text-md line-through">{Number(product.marketPrice).toFixed(0)} <small className="text-[10px]">د.م</small></p>
                  </div>
                </div>

                {/* الأزرار */}
                <div className="mt-auto space-y-2">
                  <Link 
                    href={`/seller/products/${product.id}`}
                    className="block w-full text-center py-2.5 rounded-xl border-2 border-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-50 transition"
                  >
                    عرض التفاصيل 🔍
                  </Link>
                  
                  {product.stock > 0 ? (
                    <Link 
                      href={`/seller/orders/new?productId=${product.id}`}
                      className="block w-full text-center py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-md transition transform active:scale-95"
                    >
                      بيع هذا المنتج 🚀
                    </Link>
                  ) : (
                    <button 
                      disabled 
                      className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 font-bold text-sm cursor-not-allowed"
                    >
                      غير متوفر حالياً
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}