"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { moroccanCities } from "@/lib/moroccan-cities";

const ALL_CITIES = moroccanCities.flatMap(r => r.cities).sort((a, b) => a.localeCompare(b));

function CitySearch({ value, onChange, error }: { value: string; onChange: (c: string) => void; error?: string }) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const suggestions = query.length >= 1
    ? ALL_CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (city: string) => { setQuery(city); onChange(city); setOpen(false); };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">🔍</span>
        <input
          type="text"
          value={query}
          placeholder="ابحث عن مدينة..."
          className={`w-full border ${error ? "border-red-400" : "border-gray-200 focus:border-[#4361EE]"} pr-9 pl-3 py-3 rounded-xl outline-none transition bg-white text-[#1E293B]`}
          onChange={e => { setQuery(e.target.value); onChange(""); setOpen(true); }}
          onFocus={() => query.length >= 1 && setOpen(true)}
          autoComplete="off"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(""); onChange(""); setOpen(false); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-lg leading-none">×</button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {suggestions.map(city => (
            <li key={city}
              onMouseDown={() => select(city)}
              className="px-4 py-2.5 text-sm text-[#1E293B] hover:bg-[#EEF2FF] hover:text-[#4361EE] cursor-pointer font-medium transition">
              {city}
            </li>
          ))}
        </ul>
      )}
      {open && query.length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-lg px-4 py-3 text-sm text-slate-400">
          لا توجد مدن مطابقة
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 focus:border-[#4361EE] p-3 rounded-xl outline-none transition bg-white text-[#1E293B]";
const labelCls = "block text-sm font-bold text-[#1E293B] mb-2";

function OrderForm() {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cityValue, setCityValue] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedId = searchParams.get("productId");
  const codAmount = watch("codAmount");

  useEffect(() => {
    const tid = toast.loading("جاري جلب المنتجات...");
    axios.get("/api/seller/products").then(res => {
      setProducts(res.data.products);
      toast.dismiss(tid);
    }).catch(() => toast.error("فشل تحميل المنتجات", { id: tid }));
  }, []);

  useEffect(() => {
    if (preSelectedId && products.length > 0) {
      const product: any = products.find((p: any) => p.id === preSelectedId);
      if (product) {
        setValue("productId", product.id);
        setValue("productName", product.name);
        setValue("codAmount", product.marketPrice);
        setSelectedProduct(product);
      }
    }
  }, [preSelectedId, products, setValue]);

  const handleProductChange = (e: any) => {
    const product: any = products.find((p: any) => p.id === e.target.value);
    setSelectedProduct(product || null);
    if (product) { setValue("productName", product.name); setValue("codAmount", product.marketPrice); }
  };

  const validatePhone = (v: string) => /^(?:(?:\+|00)212|0)[5-7]\d{8}$/.test(v) || "رقم الهاتف غير صحيح (06xxxxxxxx)";

  const profit = selectedProduct && codAmount
    ? Number(codAmount) - Number(selectedProduct.sellerPrice)
    : 0;

  const onSubmit = async (data: any) => {
    setLoading(true);
    const tid = toast.loading("جاري تسجيل الطلب...");
    try {
      await axios.post("/api/seller/orders/create", data);
      toast.success("تمت إضافة الطلب للمسودات! 🚀", { id: tid });
      setTimeout(() => router.push("/seller/orders/drafts"), 1000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "حدث خطأ", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Product selector + profit card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5">
        <div className="flex flex-col md:flex-row gap-5 items-start">
          <div className="flex-1">
            <label className={labelCls}>المنتج المراد بيعه</label>
            <select
              {...register("productId", { required: "يجب اختيار منتج" })}
              className={inputCls + " bg-white"}
              value={selectedProduct?.id || ""}
              onChange={handleProductChange}
            >
              <option value="">-- اختر من القائمة --</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} (مخزون: {p.stock})</option>
              ))}
            </select>
            {errors.productId && <p className="text-red-500 text-xs mt-1">{String(errors.productId.message)}</p>}
          </div>

          {selectedProduct && (
            <div className={`p-4 rounded-2xl border min-w-[140px] text-center flex-shrink-0 ${
              profit > 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}>
              <p className="text-xs font-bold text-slate-500 mb-1">ربحك المتوقع</p>
              <p className={`text-2xl font-black ${profit > 0 ? "text-green-600" : "text-red-600"}`}>
                {profit.toFixed(0)} <small className="text-sm">د.م</small>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Customer info */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-5 space-y-4">
        <h3 className="font-bold text-[#1E293B] text-sm border-b border-[#E2E8F0] pb-3">بيانات الزبون</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>اسم الزبون</label>
            <input {...register("customerName", { required: "الاسم مطلوب" })} className={inputCls} placeholder="الاسم الكامل" />
            {errors.customerName && <p className="text-red-500 text-xs mt-1">{String(errors.customerName.message)}</p>}
          </div>
          <div>
            <label className={labelCls}>رقم الهاتف</label>
            <input
              {...register("customerPhone", { required: "الهاتف مطلوب", validate: validatePhone })}
              className={inputCls + (errors.customerPhone ? " border-red-400" : "")}
              placeholder="06xxxxxxxx" type="tel"
            />
            {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{String(errors.customerPhone.message)}</p>}
          </div>
        </div>

        <div>
          <label className={labelCls}>العنوان</label>
          <input {...register("address", { required: "العنوان مطلوب" })} className={inputCls} placeholder="رقم الدار، الزنقة، الحي..." />
          {errors.address && <p className="text-red-500 text-xs mt-1">{String(errors.address.message)}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>المدينة</label>
            <input type="hidden" {...register("city", { required: "المدينة مطلوبة" })} value={cityValue} />
            <CitySearch
              value={cityValue}
              onChange={city => { setCityValue(city); setValue("city", city, { shouldValidate: true }); }}
              error={errors.city ? String(errors.city.message) : undefined}
            />
          </div>
          <div>
            <label className={labelCls}>الكمية</label>
            <input type="number" {...register("quantity", { required: true, min: 1 })} className={inputCls + " text-center font-bold"} defaultValue={1} min={1} />
          </div>
        </div>
      </div>

      {/* COD amount */}
      <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-5 space-y-3">
        <label className="block text-sm font-bold text-green-700">مبلغ التحصيل من الزبون (COD)</label>
        <div className="relative">
          <input
            type="number" step="0.01"
            {...register("codAmount", { required: "المبلغ مطلوب", min: 0 })}
            className="w-full border-2 border-green-200 focus:border-green-500 p-3.5 rounded-xl outline-none font-bold text-lg text-green-800 bg-white"
            placeholder="0.00"
          />
          <span className="absolute left-4 top-4 text-green-600 font-bold text-sm">د.م</span>
        </div>
        {selectedProduct && (
          <div className="flex justify-between text-xs text-slate-500">
            <span>تكلفتك: <strong className="text-[#4361EE]">{Number(selectedProduct.sellerPrice).toFixed(2)} د.م</strong></span>
            <span>سعر السوق المقترح: <strong className="text-green-600">{Number(selectedProduct.marketPrice).toFixed(2)} د.م</strong></span>
          </div>
        )}
      </div>

      <button
        disabled={loading}
        className="w-full bg-[#4361EE] hover:bg-[#3254D4] text-white py-4 rounded-xl font-bold transition shadow-sm text-base disabled:opacity-60 flex justify-center items-center gap-2"
      >
        {loading ? (
          <><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>جاري المعالجة...</>
        ) : "تأكيد الطلب 🚀"}
      </button>
    </form>
  );
}

export default function NewOrderPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#1E293B]">إضافة طلب جديد</h2>
        <p className="text-slate-400 text-sm mt-0.5">أدخل بيانات الزبون بدقة لضمان توصيل سريع</p>
      </div>
      <Suspense fallback={<div className="text-center p-10 text-[#4361EE]">جاري التحميل...</div>}>
        <OrderForm />
      </Suspense>
    </div>
  );
}
