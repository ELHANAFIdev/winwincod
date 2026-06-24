"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

// ─── Moroccan cities list ──────────────────────────────────────────────────────

const CITIES = [
  "الدار البيضاء", "الرباط", "فاس", "مراكش", "أكادير", "طنجة", "مكناس",
  "وجدة", "القنيطرة", "تطوان", "سلا", "الجديدة", "بني ملال", "خريبكة",
  "سطات", "برشيد", "تيزنيت", "ورزازات", "طانطان", "العيون", "الداخلة",
  "الناظور", "الحسيمة", "تازة", "بركان", "الرشيدية", "إفران", "خنيفرة",
  "أزيلال", "زاكورة", "ميدلت", "صفرو", "جرادة", "الدريوش",
  "الفقيه بن صالح", "قلعة السراغنة", "تارودانت", "تيفلت", "الخميسات",
  "العرائش", "أصيلة", "بوجدور", "الصخيرات", "تمارة",
].sort();

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileForm {
  name: string;
  phone: string;
  city: string;
  storeName: string;
  storeDescription: string;
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-400">الخطوة {step} من {total}</span>
        <span className="text-xs font-bold text-[#4361EE]">{Math.round((step / total) * 100)}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#4361EE] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ─── Step 1: Welcome ──────────────────────────────────────────────────────────

function Step1({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-6 animate-fade-in">
      {/* Logo */}
      <div className="bg-[#4361EE] rounded-2xl p-4 shadow-lg shadow-blue-200">
        <Image src="/logo-white.svg" alt="WinWinCOD" width={120} height={40} priority />
      </div>

      {/* Headline */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-[#1E293B] leading-tight">
          مرحباً بك في<br />
          <span className="text-[#4361EE]">WinWinCOD</span> 🎉
        </h1>
        <p className="text-slate-500 text-base mt-3 font-medium">
          منصة التجارة الإلكترونية بالدفع عند الاستلام
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        {[
          {
            icon: "🚀",
            title: "ابدأ بدون رأس مال",
            desc: "لا تحتاج دفع مسبق للمنتجات",
            color: "from-blue-50 to-indigo-50 border-blue-100",
          },
          {
            icon: "📦",
            title: "شحن سريع",
            desc: "توصيل لجميع مدن المغرب",
            color: "from-orange-50 to-amber-50 border-orange-100",
          },
          {
            icon: "💰",
            title: "أرباح مضمونة",
            desc: "استلم أرباحك بعد كل تسليم",
            color: "from-green-50 to-emerald-50 border-green-100",
          },
        ].map((f) => (
          <div
            key={f.title}
            className={`bg-gradient-to-br ${f.color} border rounded-2xl p-4 text-center`}
          >
            <span className="text-4xl block mb-3">{f.icon}</span>
            <p className="font-black text-[#1E293B] text-sm mb-1">{f.title}</p>
            <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-full bg-[#4361EE] hover:bg-[#3254D4] text-white font-black text-lg py-4 rounded-2xl transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 min-h-[60px]"
      >
        ابدأ الآن
        <span className="text-xl">←</span>
      </button>
    </div>
  );
}

// ─── Step 2: Profile form ─────────────────────────────────────────────────────

function Step2({
  form,
  onChange,
  onNext,
}: {
  form: ProfileForm;
  onChange: (f: Partial<ProfileForm>) => void;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = "الاسم مطلوب (حرفان على الأقل)";
    if (!/^(06|07)\d{8}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "رقم الهاتف غير صحيح (06XXXXXXXX أو 07XXXXXXXX)";
    if (!form.city) e.city = "يرجى اختيار المدينة";
    if (!form.storeName.trim() || form.storeName.trim().length < 2)
      e.storeName = "اسم المتجر مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) onNext(); };

  const field = (
    key: keyof ProfileForm,
    label: string,
    placeholder: string,
    required = true,
    type = "text",
  ) => (
    <div>
      <label className="text-xs font-bold text-slate-500 block mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => { onChange({ [key]: e.target.value }); setErrors((ev) => ({ ...ev, [key]: undefined })); }}
        placeholder={placeholder}
        className={`w-full border ${errors[key] ? "border-red-400 bg-red-50" : "border-[#E2E8F0] bg-[#F8FAFC]"} focus:border-[#4361EE] focus:bg-white p-3.5 rounded-xl outline-none text-sm font-medium transition`}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1 font-medium">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <span className="text-4xl">👤</span>
        <h2 className="text-2xl font-black text-[#1E293B] mt-2">أكمل ملفك الشخصي</h2>
        <p className="text-slate-400 text-sm mt-1">هذه المعلومات تساعدنا على خدمتك بشكل أفضل</p>
      </div>

      {field("name",      "الاسم الكامل",   "محمد أحمد")}
      {field("phone",     "رقم الهاتف",     "06XXXXXXXX", true, "tel")}

      {/* City dropdown */}
      <div>
        <label className="text-xs font-bold text-slate-500 block mb-1.5">
          المدينة <span className="text-red-500">*</span>
        </label>
        <select
          value={form.city}
          onChange={(e) => { onChange({ city: e.target.value }); setErrors((ev) => ({ ...ev, city: undefined })); }}
          className={`w-full border ${errors.city ? "border-red-400 bg-red-50" : "border-[#E2E8F0] bg-[#F8FAFC]"} focus:border-[#4361EE] focus:bg-white p-3.5 rounded-xl outline-none text-sm font-medium transition appearance-none`}
        >
          <option value="">اختر مدينتك...</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.city && <p className="text-red-500 text-xs mt-1 font-medium">{errors.city}</p>}
      </div>

      {field("storeName", "اسم المتجر",     "متجر الفردوس")}

      {/* Store description (optional) */}
      <div>
        <label className="text-xs font-bold text-slate-500 block mb-1.5">
          وصف المتجر <span className="text-slate-300">(اختياري)</span>
        </label>
        <textarea
          value={form.storeDescription}
          onChange={(e) => onChange({ storeDescription: e.target.value })}
          placeholder="صف متجرك باختصار..."
          rows={3}
          className="w-full border border-[#E2E8F0] bg-[#F8FAFC] focus:border-[#4361EE] focus:bg-white p-3.5 rounded-xl outline-none text-sm font-medium transition resize-none"
        />
      </div>

      <button
        onClick={handleNext}
        className="w-full bg-[#4361EE] hover:bg-[#3254D4] text-white font-black text-lg py-4 rounded-2xl transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 min-h-[60px]"
      >
        التالي <span className="text-xl">←</span>
      </button>
    </div>
  );
}

// ─── Step 3: How it works ─────────────────────────────────────────────────────

function Step3({ onNext }: { onNext: () => void }) {
  const steps = [
    { icon: "📋", title: "أضف منتجاتك",             desc: "حدد سعر البيع والتكلفة لكل منتج" },
    { icon: "📞", title: "فريقنا يتصل بالعملاء",    desc: "نؤكد الطلبات مع عملائك نيابة عنك" },
    { icon: "🚚", title: "نرسل للعميل",              desc: "شركة التوصيل تتكفل بإيصال الطلب" },
    { icon: "💰", title: "تستلم أرباحك",             desc: "الربح = سعر البيع - التكلفة - رسوم الشحن" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-4xl">📖</span>
        <h2 className="text-2xl font-black text-[#1E293B] mt-2">كيف تعمل المنصة؟</h2>
        <p className="text-slate-400 text-sm mt-1">4 خطوات بسيطة لتحقيق أرباحك</p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {steps.map((s, i) => (
          <div key={i} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#4361EE] text-white font-black text-sm flex items-center justify-center flex-shrink-0">
              {i + 1}
            </div>
            <div>
              <p className="font-black text-[#1E293B] text-sm">
                {s.icon} {s.title}
              </p>
              <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing example */}
      <div className="bg-gradient-to-br from-[#4361EE] to-[#3254D4] rounded-2xl p-5 text-white">
        <p className="font-black text-base mb-4 flex items-center gap-2">
          💡 مثال على الأرباح
        </p>
        <div className="space-y-2.5">
          {[
            { label: "سعر البيع",     value: "150 درهم", color: "text-white", op: "" },
            { label: "تكلفة المنتج", value: "60 درهم",  color: "text-red-300", op: "−" },
            { label: "رسوم الشحن",   value: "20 درهم",  color: "text-red-300", op: "−" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-blue-100 text-sm font-medium">{row.label}</span>
              <span className={`font-black text-base ${row.color}`}>
                {row.op} {row.value}
              </span>
            </div>
          ))}
          <div className="border-t border-white/20 pt-2.5 flex items-center justify-between">
            <span className="text-white font-black">✅ ربحك الصافي</span>
            <span className="text-green-300 font-black text-xl">70 درهم</span>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-[#4361EE] hover:bg-[#3254D4] text-white font-black text-lg py-4 rounded-2xl transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 min-h-[60px]"
      >
        فهمت! التالي <span className="text-xl">←</span>
      </button>
    </div>
  );
}

// ─── Step 4: Wallet funding ───────────────────────────────────────────────────

function Step4({
  onComplete,
  submitting,
}: {
  onComplete: (goWallet: boolean) => void;
  submitting: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-4xl">💰</span>
        <h2 className="text-2xl font-black text-[#1E293B] mt-2">شحن المحفظة</h2>
        <p className="text-slate-400 text-sm mt-1 leading-relaxed">
          لإضافة طلباتك، تحتاج رصيداً في محفظتك لتغطية تكاليف الشحن
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">⚠️</span>
        <div>
          <p className="font-black text-amber-800 text-sm">الرصيد الأدنى الموصى به</p>
          <p className="text-amber-700 font-black text-3xl mt-1">200 درهم</p>
          <p className="text-amber-600 text-xs mt-1">يكفي لتغطية رسوم الشحن لأول طلباتك</p>
        </div>
      </div>

      {/* Bank transfer card */}
      <div className="bg-white border-2 border-[#4361EE]/20 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏦</span>
          <p className="font-black text-[#1E293B]">تفاصيل التحويل البنكي</p>
        </div>
        <div className="space-y-3">
          {[
            { label: "البنك",   value: "CIH Bank" },
            { label: "الحساب", value: "XXXXXXXXXXXX" },
            { label: "الاسم",  value: "WinWinCOD" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between bg-[#F8FAFC] rounded-xl px-4 py-3">
              <span className="text-slate-400 text-sm font-bold">{row.label}</span>
              <span className="font-black text-[#1E293B] text-sm font-mono">{row.value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center leading-relaxed">
          بعد التحويل، أرفع وصل الدفع في صفحة المحفظة وسيتم تأكيد الشحن خلال 24 ساعة
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => onComplete(true)}
          disabled={submitting}
          className="w-full bg-[#FB923C] hover:bg-orange-500 disabled:opacity-60 text-white font-black text-lg py-4 rounded-2xl transition shadow-lg shadow-orange-200 flex items-center justify-center gap-2 min-h-[60px]"
        >
          {submitting ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-xl">💳</span>
              شحن المحفظة الآن
            </>
          )}
        </button>

        <button
          onClick={() => onComplete(false)}
          disabled={submitting}
          className="w-full border-2 border-[#E2E8F0] text-slate-500 hover:border-[#4361EE] hover:text-[#4361EE] font-bold text-base py-3.5 rounded-2xl transition flex items-center justify-center gap-2 min-h-[52px]"
        >
          سأشحنها لاحقاً — ابدأ بالاستكشاف
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    phone: "",
    city: "",
    storeName: "",
    storeDescription: "",
  });

  // Pre-fill name from session
  useEffect(() => {
    if (session?.user?.name && !form.name) {
      setForm((f) => ({ ...f, name: session.user!.name! }));
    }
  }, [session]);

  const updateForm = (patch: Partial<ProfileForm>) =>
    setForm((f) => ({ ...f, ...patch }));

  const completeOnboarding = async (goWallet: boolean) => {
    setSubmitting(true);
    setApiError(null);
    try {
      await axios.post("/api/seller/onboarding", {
        name:             form.name,
        phone:            form.phone,
        city:             form.city,
        storeName:        form.storeName,
        storeDescription: form.storeDescription,
      });

      // Refresh JWT so middleware sees hasCompletedOnboarding = true
      await update();

      router.push(goWallet ? "/seller/wallet" : "/seller/dashboard");
    } catch (err: any) {
      setApiError(err.response?.data?.error || "حدث خطأ، حاول مجدداً");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#EEF2FF] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-lg">
        {/* Progress bar (hidden on step 1) */}
        {step > 1 && (
          <div className="mb-6">
            <ProgressBar step={step} total={4} />
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 p-6 md:p-8">
          {/* Step 1 logo shown inside card; other steps show back button */}
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-[#4361EE] text-sm font-bold mb-5 transition"
            >
              <span className="text-base">→</span> رجوع
            </button>
          )}

          {step === 1 && <Step1 onNext={() => setStep(2)} />}
          {step === 2 && (
            <Step2
              form={form}
              onChange={updateForm}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && <Step3 onNext={() => setStep(4)} />}
          {step === 4 && (
            <Step4 onComplete={completeOnboarding} submitting={submitting} />
          )}

          {/* API error */}
          {apiError && step === 4 && (
            <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm font-bold text-center">
              {apiError}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-4 font-medium">
          WinWinCOD © {new Date().getFullYear()} — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
