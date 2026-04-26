"use client";
import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast"; // 👈 استيراد الإشعارات
import { moroccanCities } from "@/lib/moroccan-cities"; // 👈 استيراد المدن

function OrderForm() {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedRegion, setSelectedRegion] = useState("");
  const availableCities = moroccanCities.find(r => r.region === selectedRegion)?.cities || [];
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedId = searchParams.get("productId");

  // مراقبة القيم لحساب الربح والتحقق
  const codAmount = watch("codAmount");
  const phone = watch("customerPhone");

  // 1. جلب المنتجات
  useEffect(() => {
    const fetchProducts = async () => {
      const toastId = toast.loading("جاري جلب المنتجات...");
      try {
        const res = await axios.get("/api/seller/products");
        setProducts(res.data.products);
        toast.dismiss(toastId);
      } catch (err) {
        toast.error("فشل تحميل المنتجات", { id: toastId });
      }
    };
    fetchProducts();
  }, []);

  // 2. تحديد المنتج تلقائياً من الرابط
  useEffect(() => {
    if (preSelectedId && products.length > 0) {
      const product: any = products.find((p: any) => p.id === preSelectedId);
      if (product) {
        setValue("productId", product.id);
        setValue("productName", product.name);
        // تعيين سعر البيع المقترح تلقائياً
        setValue("codAmount", product.marketPrice);
        setSelectedProduct(product);
      }
    }
  }, [preSelectedId, products, setValue]);

  const handleProductChange = (e: any) => {
    const product: any = products.find((p: any) => p.id === e.target.value);
    setSelectedProduct(product || null);
    if(product) {
        setValue("productName", product.name);
        setValue("codAmount", product.marketPrice); // اقتراح السعر
    }
  };

  // 3. التحقق من صحة رقم الهاتف المغربي
  const validateMoroccanPhone = (value: string) => {
    const regex = /^(?:(?:\+|00)212|0)[5-7]\d{8}$/;
    return regex.test(value) || "يرجى إدخال رقم هاتف مغربي صحيح (06xxxxxxxx)";
  };

  // 4. حساب الربح المتوقع (ديناميكي)
  const calculateProfit = () => {
    if (!selectedProduct || !codAmount) return 0;
    const cost = Number(selectedProduct.sellerPrice);
    const sellingPrice = Number(codAmount);
    return sellingPrice - cost;
  };

  const profit = calculateProfit();

  const onSubmit = async (data: any) => {
    setLoading(true);
    const toastId = toast.loading("جاري تسجيل الطلب...");
    
    try {
      await axios.post("/api/seller/orders/create", data);
      toast.success("تمت إضافة الطلب للمسودات بنجاح! 🚀", { id: toastId });
      
      // خيار: هل يريد البائع الذهاب للمسودات أم إضافة طلب آخر؟
      // هنا سنوجهه للمسودات كالسابق
      setTimeout(() => router.push("/seller/orders/drafts"), 1000);
      
    } catch (error: any) {
      toast.error(error.response?.data?.error || "حدث خطأ أثناء الحفظ", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* بطاقة اختيار المنتج والربح */}
      <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-bold mb-2 text-gray-700">المنتج المراد بيعه</label>
            <select 
              {...register("productId", { required: "يجب اختيار منتج" })} 
              className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 outline-none bg-gray-50"
              value={selectedProduct?.id || ""}
              onChange={handleProductChange}
            >
              <option value="">-- اختر من القائمة --</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} (مخزون: {p.stock})
                </option>
              ))}
            </select>
            {errors.productId && <p className="text-red-500 text-xs mt-1">{String(errors.productId.message)}</p>}
          </div>

          {/* حاسبة الربح الفورية */}
          {selectedProduct && (
            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center min-w-[150px] transition-all
              ${profit > 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <span className="text-xs font-bold text-gray-500">ربحك المتوقع</span>
              <span className={`text-2xl font-black ${profit > 0 ? "text-green-600" : "text-red-600"}`}>
                {profit.toFixed(0)} <small className="text-xs">د.م</small>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* بيانات الزبون */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">اسم الزبون</label>
            <input 
              {...register("customerName", { required: "اسم الزبون مطلوب" })} 
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="الاسم الكامل" 
            />
            {errors.customerName && <p className="text-red-500 text-xs mt-1">{String(errors.customerName.message)}</p>}
        </div>

        <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">رقم الهاتف</label>
            <input 
              {...register("customerPhone", { 
                required: "رقم الهاتف مطلوب",
                validate: validateMoroccanPhone 
              })} 
              className={`w-full border p-3 rounded-xl focus:ring-2 outline-none ${errors.customerPhone ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-500'}`} 
              placeholder="06xxxxxxxx" 
              type="tel"
            />
            {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{String(errors.customerPhone.message)}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-2 text-gray-700">العنوان</label>
        <input 
          {...register("address", { required: "العنوان مطلوب" })} 
          className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
          placeholder="رقم الدار، الزنقة، الحي..." 
        />
        {errors.address && <p className="text-red-500 text-xs mt-1">{String(errors.address.message)}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">الجهة (Region)</label>
            <select 
              className="w-full border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setValue("city", ""); // reset city
              }}
            >
              <option value="">-- اختر الجهة --</option>
              {moroccanCities.map(regionObj => (
                <option key={regionObj.region} value={regionObj.region}>{regionObj.region}</option>
              ))}
            </select>
        </div>

        <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">المدينة</label>
            <select 
              {...register("city", { required: "المدينة مطلوبة" })} 
              className="w-full border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
              disabled={!selectedRegion}
            >
              <option value="">-- اختر المدينة --</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.city && <p className="text-red-500 text-xs mt-1">{String(errors.city.message)}</p>}
        </div>

        <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">الكمية</label>
            <input 
              type="number" 
              {...register("quantity", { required: true, min: 1 })} 
              className="w-full border p-3 rounded-xl text-center font-bold outline-none focus:ring-2 focus:ring-blue-500" 
              defaultValue={1} 
              min={1} 
            />
        </div>
      </div>

      {/* مبلغ التحصيل */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <label className="block text-sm font-bold mb-2 text-green-700">مبلغ التحصيل من الزبون (COD)</label>
        <div className="relative">
            <input 
                type="number" 
                step="0.01"
                {...register("codAmount", { required: "المبلغ مطلوب", min: 0 })} 
                className="w-full border-2 border-green-200 p-3 rounded-xl focus:border-green-500 outline-none font-bold text-lg text-green-800" 
                placeholder="0.00" 
            />
            <span className="absolute left-4 top-3.5 text-green-600 font-bold">د.م</span>
        </div>
        <p className="text-xs text-gray-500 mt-2 flex justify-between">
            <span>سعر التكلفة عليك: <strong>{selectedProduct ? Number(selectedProduct.sellerPrice).toFixed(2) : '0.00'}</strong></span>
            <span>سعر السوق المقترح: <strong>{selectedProduct ? Number(selectedProduct.marketPrice).toFixed(2) : '0.00'}</strong></span>
        </p>
      </div>

      <button 
        disabled={loading} 
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform active:scale-95 text-lg flex justify-center items-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            جاري المعالجة...
          </>
        ) : "تأكيد الطلب 🚀"}
      </button>
    </form>
  );
}

export default function NewOrderPage() {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="mb-8 pb-4 border-b border-gray-100">
        <h3 className="text-2xl font-black text-gray-800">إضافة طلب جديد 📦</h3>
        <p className="text-gray-500 text-sm">أدخل بيانات الزبون بدقة لضمان توصيل سريع</p>
      </div>
      <Suspense fallback={<div className="text-center p-10">جاري التحميل...</div>}>
        <OrderForm />
      </Suspense>
    </div>
  );
}