"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { moroccanCities } from "@/lib/moroccan-cities";

const ALL_CITIES = moroccanCities.flatMap(r => r.cities).sort((a, b) => a.localeCompare(b));

// ── City search ────────────────────────────────────────────────────────────────
function CitySearch({ value, onChange, error }: {
  value: string; onChange: (c: string) => void; error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = query.length >= 1
    ? ALL_CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : ALL_CITIES;

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 40); }, [open]);

  const select = (city: string) => { onChange(city); setOpen(false); setQuery(""); };

  return (
    <div ref={ref}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between border text-sm px-3 py-2.5 rounded-xl bg-white text-[#1E293B] transition ${
          error ? "border-red-400" : open ? "border-[#4361EE]" : "border-gray-200 hover:border-[#4361EE]"
        }`}>
        <span className={value ? "font-bold" : "text-slate-400"}>{value || "اختر المدينة..."}</span>
        <span className={`text-slate-400 text-xs transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && (
        <div className="mt-1 border border-[#4361EE]/30 rounded-xl bg-white shadow-xl overflow-hidden z-10 relative">
          <div className="p-2 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
              placeholder="ابحث عن مدينة..." autoComplete="off"
              className="w-full border border-[#E2E8F0] focus:border-[#4361EE] px-3 py-1.5 rounded-lg text-sm outline-none bg-white" />
          </div>
          <ul className="overflow-y-auto max-h-[180px]">
            {filtered.length === 0
              ? <li className="px-4 py-3 text-sm text-slate-400 text-center">لا نتائج</li>
              : filtered.map(city => (
                <li key={city} onMouseDown={() => select(city)}
                  className={`px-3 py-2 text-sm cursor-pointer font-medium border-b border-[#F1F5F9] last:border-0 ${
                    value === city ? "bg-[#4361EE] text-white" : "text-[#1E293B] hover:bg-[#EEF2FF] hover:text-[#4361EE]"
                  }`}>
                  {city}
                </li>
              ))}
          </ul>
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────────
type OrderForm = { customerName: string; customerPhone: string; address: string; city: string; codAmount: string };
type FormErrors = Partial<Record<keyof OrderForm, string>>;

const initForm = (marketPrice: number): OrderForm => ({
  customerName: "", customerPhone: "", address: "", city: "",
  codAmount: String(Math.round(marketPrice)),
});

function validate(f: OrderForm): FormErrors {
  const e: FormErrors = {};
  if (!f.customerName.trim() || f.customerName.trim().length < 2) e.customerName = "الاسم مطلوب";
  if (!/^(?:(?:\+|00)212|0)[5-7]\d{8}$/.test(f.customerPhone)) e.customerPhone = "رقم غير صحيح";
  if (!f.address.trim() || f.address.trim().length < 3) e.address = "العنوان مطلوب";
  if (!f.city) e.city = "المدينة مطلوبة";
  if (isNaN(Number(f.codAmount)) || Number(f.codAmount) < 0) e.codAmount = "مبلغ غير صحيح";
  return e;
}

// ── Success view ───────────────────────────────────────────────────────────────
function SuccessView({ orders }: { orders: { id: string; productName: string; customerName: string; amount: number }[] }) {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="bg-white rounded-2xl border border-green-200 p-8 text-center shadow-sm">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-2xl font-black text-green-700 mb-1">تم تأكيد {orders.length} طلب بنجاح!</h2>
        <p className="text-slate-400 text-sm">ستجد طلباتك في قسم المسودات جاهزة للإرسال</p>
      </div>
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <p className="font-black text-[#1E293B] text-sm">مراجع الطلبات</p>
        </div>
        <div className="divide-y divide-[#E2E8F0]">
          {orders.map(order => (
            <div key={order.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-xs bg-[#1E293B] text-white px-2.5 py-1 rounded-lg tracking-wider">
                  ORD-{order.id.slice(-6).toUpperCase()}
                </span>
                <div>
                  <p className="font-bold text-[#1E293B] text-sm">{order.productName}</p>
                  <p className="text-xs text-slate-400">{order.customerName}</p>
                </div>
              </div>
              <span className="font-black text-green-600 text-sm">{order.amount.toFixed(2)} د.م</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <Link href="/seller/products"
          className="flex-1 bg-[#4361EE] hover:bg-[#3254D4] text-white py-4 rounded-xl font-black text-center transition">
          إضافة طلبات جديدة
        </Link>
        <Link href="/seller/orders/drafts"
          className="flex-1 bg-white border border-[#E2E8F0] hover:border-[#4361EE] text-[#1E293B] py-4 rounded-xl font-bold text-center transition">
          عرض المسودات
        </Link>
      </div>
    </div>
  );
}

// ── Checkout page ──────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, clearAll } = useCart();
  const [forms, setForms] = useState<Record<string, OrderForm>>({});
  const [errors, setErrors] = useState<Record<string, FormErrors>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ id: string; productName: string; customerName: string; amount: number }[] | null>(null);

  useEffect(() => {
    setForms(prev => {
      const next: Record<string, OrderForm> = {};
      for (const item of items) {
        next[item.cartId] = prev[item.cartId] ?? initForm(item.marketPrice);
      }
      return next;
    });
  }, [items]);

  const setField = (cartId: string, field: keyof OrderForm, value: string) => {
    setForms(prev => ({ ...prev, [cartId]: { ...prev[cartId], [field]: value } }));
    if (errors[cartId]?.[field]) {
      setErrors(prev => ({ ...prev, [cartId]: { ...prev[cartId], [field]: undefined } }));
    }
  };

  const handleSubmit = async () => {
    const allErrors: Record<string, FormErrors> = {};
    let hasErrors = false;
    for (const item of items) {
      const errs = validate(forms[item.cartId] || initForm(item.marketPrice));
      if (Object.keys(errs).length > 0) { allErrors[item.cartId] = errs; hasErrors = true; }
    }
    if (hasErrors) { setErrors(allErrors); toast.error("يرجى تصحيح الأخطاء أولاً"); return; }

    setSubmitting(true);
    try {
      const orders = items.map(item => {
        const f = forms[item.cartId];
        return {
          productId: item.productId, productName: item.productName, quantity: item.quantity,
          customerName: f.customerName, customerPhone: f.customerPhone,
          address: f.address, city: f.city, codAmount: Number(f.codAmount),
        };
      });
      const res = await axios.post("/api/seller/orders/create-bulk", { orders });
      clearAll();
      setSuccess(items.map((item, i) => ({
        id: res.data.orderIds[i],
        productName: item.productName,
        customerName: forms[item.cartId].customerName,
        amount: Number(forms[item.cartId].codAmount),
      })));
      toast.success("تم تأكيد جميع الطلبات 🎉");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return <SuccessView orders={success} />;

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] p-16 text-center space-y-4">
        <p className="text-5xl">🛒</p>
        <p className="font-black text-[#1E293B] text-lg">السلة فارغة</p>
        <Link href="/seller/products"
          className="inline-block bg-[#4361EE] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#3254D4] transition">
          تصفح المنتجات
        </Link>
      </div>
    </div>
  );

  const totalCOD = items.reduce((s, item) => s + Number(forms[item.cartId]?.codAmount || item.marketPrice), 0);
  const totalProfit = items.reduce((s, item) => {
    return s + Number(forms[item.cartId]?.codAmount || item.marketPrice) - item.sellerPrice * item.quantity;
  }, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-[#1E293B]">إتمام الطلبات</h2>
          <p className="text-slate-400 text-sm mt-0.5">{items.length} طلب — أدخل بيانات كل زبون</p>
        </div>
        <Link href="/seller/products" className="text-sm font-bold text-[#4361EE] hover:underline">
          ← العودة للمنتجات
        </Link>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => {
          const form = forms[item.cartId] || initForm(item.marketPrice);
          const itemErrors = errors[item.cartId] || {};
          const cod = Number(form.codAmount) || 0;
          const profit = cod - item.sellerPrice * item.quantity;

          return (
            <div key={item.cartId} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              {/* Product header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <span className="w-7 h-7 bg-[#4361EE] text-white rounded-full flex items-center justify-center text-sm font-black flex-shrink-0">
                  {index + 1}
                </span>
                {item.productImage && (
                  <img src={item.productImage} alt={item.productName}
                    className="w-10 h-10 rounded-lg object-contain bg-white border border-[#E2E8F0] flex-shrink-0"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-[#1E293B] text-sm truncate">{item.productName}</p>
                  <p className="text-xs text-slate-400">
                    {item.quantity} وحدة × {item.sellerPrice.toFixed(0)} د.م
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-black flex-shrink-0 ${
                  profit > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                }`}>
                  ربح: {profit.toFixed(0)} د.م
                </span>
              </div>

              {/* Customer form */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">اسم الزبون</label>
                  <input value={form.customerName}
                    onChange={e => setField(item.cartId, "customerName", e.target.value)}
                    placeholder="الاسم الكامل"
                    className={`w-full border text-sm px-3 py-2.5 rounded-xl outline-none bg-white text-[#1E293B] transition ${
                      itemErrors.customerName ? "border-red-400" : "border-gray-200 focus:border-[#4361EE]"
                    }`} />
                  {itemErrors.customerName && <p className="text-red-500 text-xs mt-1">{itemErrors.customerName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">رقم الهاتف</label>
                  <input value={form.customerPhone} type="tel"
                    onChange={e => setField(item.cartId, "customerPhone", e.target.value)}
                    placeholder="06xxxxxxxx"
                    className={`w-full border text-sm px-3 py-2.5 rounded-xl outline-none bg-white text-[#1E293B] transition ${
                      itemErrors.customerPhone ? "border-red-400" : "border-gray-200 focus:border-[#4361EE]"
                    }`} />
                  {itemErrors.customerPhone && <p className="text-red-500 text-xs mt-1">{itemErrors.customerPhone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">العنوان</label>
                  <input value={form.address}
                    onChange={e => setField(item.cartId, "address", e.target.value)}
                    placeholder="رقم الدار، الزنقة، الحي..."
                    className={`w-full border text-sm px-3 py-2.5 rounded-xl outline-none bg-white text-[#1E293B] transition ${
                      itemErrors.address ? "border-red-400" : "border-gray-200 focus:border-[#4361EE]"
                    }`} />
                  {itemErrors.address && <p className="text-red-500 text-xs mt-1">{itemErrors.address}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">المدينة</label>
                  <CitySearch value={form.city}
                    onChange={city => setField(item.cartId, "city", city)}
                    error={itemErrors.city} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">مبلغ التحصيل COD</label>
                  <div className="relative">
                    <input type="number" value={form.codAmount}
                      onChange={e => setField(item.cartId, "codAmount", e.target.value)}
                      className={`w-full border-2 text-sm px-3 py-2.5 pl-12 rounded-xl outline-none font-bold text-green-800 bg-white transition ${
                        itemErrors.codAmount ? "border-red-400" : "border-green-200 focus:border-green-500"
                      }`} />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 text-xs font-bold">د.م</span>
                  </div>
                  {itemErrors.codAmount && <p className="text-red-500 text-xs mt-1">{itemErrors.codAmount}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold">إجمالي التحصيل</p>
            <p className="text-2xl font-black text-[#1E293B]">
              {totalCOD.toFixed(2)} <span className="text-base font-normal text-slate-400">د.م</span>
            </p>
          </div>
          <div className="text-left">
            <p className="text-xs text-slate-400 font-bold">الربح المتوقع</p>
            <p className={`text-xl font-black ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalProfit.toFixed(2)} <span className="text-sm font-normal">د.م</span>
            </p>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={submitting}
          className="w-full bg-[#4361EE] hover:bg-[#3254D4] disabled:opacity-60 text-white py-4 rounded-xl font-black text-base transition shadow-sm flex items-center justify-center gap-2">
          {submitting
            ? <><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />جاري تأكيد الطلبات...</>
            : `تأكيد ${items.length} طلب 🚀`}
        </button>
      </div>
    </div>
  );
}
