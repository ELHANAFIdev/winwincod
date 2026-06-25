"use client";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { CheckCircle, Truck, DollarSign, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await axios.post("/api/auth/register", formData);
      router.push("/login?error=PendingApproval");
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.error || "فشل التسجيل" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex" dir="rtl">
      {/* Brand Panel */}
      <div className="hidden lg:flex w-1/2 bg-[#3254D4] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-white rounded-full"></div>
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-black text-white mb-2">WINWIN</h1>
          <h2 className="text-3xl font-black text-[#FB923C] mb-6">COD</h2>
          <p className="text-blue-100 text-lg max-w-xs leading-relaxed">
            انضم لآلاف البائعين المغاربة وابدأ تجارتك الإلكترونية اليوم
          </p>
          <div className="mt-10 space-y-3">
            {[
              { icon: <CheckCircle className="w-4 h-4" />, text: "مخزون جاهز للبيع" },
              { icon: <Truck className="w-4 h-4" />, text: "توصيل سريع لكل المدن" },
              { icon: <DollarSign className="w-4 h-4" />, text: "أرباح تُسحب فوراً" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white/10 rounded-xl px-5 py-3 text-white text-sm font-bold">{icon} {text}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-black text-[#1E293B]">WINWIN <span className="text-[#FB923C]">COD</span></h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8">
            <h2 className="text-2xl font-black text-[#1E293B] mb-1">إنشاء حساب جديد</h2>
            <p className="text-slate-400 text-sm mb-8">أدخل بياناتك وسيتم مراجعة طلبك</p>

            {message.text && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-bold text-center border ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border-green-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}>
                {message.type === "success" ? <CheckCircle className="w-4 h-4 inline mr-1" /> : <AlertTriangle className="w-4 h-4 inline mr-1" />}{message.text}
              </div>
            )}

            {message.type !== "success" && (
              <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { key: "name", label: "الاسم الكامل", type: "text", placeholder: "محمد الأمين" },
                  { key: "email", label: "البريد الإلكتروني", type: "email", placeholder: "name@example.com" },
                  { key: "phone", label: "رقم الهاتف", type: "tel", placeholder: "06xxxxxxxx" },
                  { key: "password", label: "كلمة المرور", type: "password", placeholder: "••••••••" },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-bold text-[#1E293B] mb-2">{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      className="w-full border border-gray-200 focus:border-[#4361EE] p-3.5 rounded-xl outline-none transition bg-[#F8FAFC] focus:bg-white text-[#1E293B]"
                      required
                      value={(formData as any)[key]}
                      onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                    />
                  </div>
                ))}

                <button
                  disabled={loading}
                  className="w-full bg-[#FB923C] hover:bg-orange-500 text-white py-3.5 rounded-xl font-bold transition shadow-sm disabled:opacity-60 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      جاري التسجيل...
                    </span>
                  ) : "إنشاء الحساب"}
                </button>
              </form>

              <div className="flex items-center my-5">
                <hr className="flex-grow border-[#E2E8F0]" />
                <span className="mx-3 text-slate-400 text-sm">أو</span>
                <hr className="flex-grow border-[#E2E8F0]" />
              </div>

              <button
                type="button"
                onClick={() => { setGoogleLoading(true); signIn("google", { callbackUrl: "/auth/redirect" }); }}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 border border-[#E2E8F0] p-3.5 rounded-xl hover:bg-[#F8FAFC] transition disabled:opacity-60"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-[#1E293B] font-bold">
                  {googleLoading ? "جاري التحميل..." : "التسجيل بـ Google"}
                </span>
              </button>
              </>
            )}

            <p className="mt-6 text-center text-sm text-slate-400">
              لديك حساب؟{" "}
              <Link href="/login" className="text-[#4361EE] font-bold hover:underline">سجل الدخول</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
