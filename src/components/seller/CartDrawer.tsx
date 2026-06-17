"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export function CartDrawer() {
  const { items, removeItem, updateQty, clearAll, drawerOpen, closeDrawer } = useCart();

  const totalCOD = items.reduce((s, i) => s + i.marketPrice * i.quantity, 0);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer — slides from the left (content side in RTL layout) */}
      <div
        className={`fixed top-0 left-0 h-full w-[360px] max-w-[92vw] bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#4361EE] flex-shrink-0">
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl">🛒</span>
            <span className="font-black text-base">سلة المشتريات</span>
            {items.length > 0 && (
              <span className="bg-white text-[#4361EE] text-xs font-black px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="text-white/70 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition"
          >
            ×
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
              <span className="text-6xl">🛒</span>
              <p className="font-black text-[#1E293B] text-lg">السلة فارغة</p>
              <p className="text-sm text-slate-400">أضف منتجات من السوق أو صفحة إضافة طلب</p>
              <button
                onClick={closeDrawer}
                className="bg-[#4361EE] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#3254D4] transition"
              >
                تصفح المنتجات
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#E2E8F0]">
              {items.map(item => (
                <li key={item.cartId} className="flex gap-3 p-4 hover:bg-[#F8FAFC] transition">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0] flex-shrink-0 flex items-center justify-center">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-contain p-1"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1E293B] text-sm line-clamp-2 leading-snug">
                      {item.productName}
                    </p>
                    <p className="text-xs text-green-600 font-bold mt-0.5">
                      {item.marketPrice.toFixed(0)} د.م / وحدة
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-[#E2E8F0] rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQty(item.cartId, -1)}
                          className="px-2.5 py-1 text-[#4361EE] font-black hover:bg-[#EEF2FF] transition text-sm"
                        >−</button>
                        <span className="px-2.5 font-black text-[#1E293B] text-sm min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.cartId, +1)}
                          disabled={item.quantity >= item.stock}
                          className="px-2.5 py-1 text-[#4361EE] font-black hover:bg-[#EEF2FF] transition text-sm disabled:opacity-30"
                        >+</button>
                      </div>
                      <button
                        onClick={() => removeItem(item.cartId)}
                        className="text-red-400 hover:text-red-600 transition text-xs font-bold"
                      >
                        حذف
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="flex-shrink-0 text-left">
                    <p className="font-black text-[#1E293B] text-sm">
                      {(item.marketPrice * item.quantity).toFixed(0)} د.م
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#E2E8F0] p-5 space-y-3 bg-[#F8FAFC] flex-shrink-0">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500">الإجمالي المتوقع</span>
              <span className="font-black text-[#1E293B] text-xl">
                {totalCOD.toFixed(2)}
                <span className="text-sm font-normal text-slate-400 mr-1">د.م</span>
              </span>
            </div>
            <Link
              href="/seller/orders/checkout"
              onClick={closeDrawer}
              className="block w-full bg-[#4361EE] hover:bg-[#3254D4] text-white py-3.5 rounded-xl font-black text-center transition shadow-sm text-sm"
            >
              إكمال الطلب 🚀
            </Link>
            <button
              onClick={clearAll}
              className="w-full text-xs font-bold text-slate-400 hover:text-red-500 transition py-1"
            >
              مسح السلة
            </button>
          </div>
        )}
      </div>
    </>
  );
}
