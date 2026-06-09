"use client";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await axios.post("/api/auth/register", formData);
      setMessage({ type: "success", text: "تم تسجيل طلبك بنجاح! سيتم تفعيل حسابك بعد مراجعة الإدارة." });
      setFormData({ name: "", email: "", phone: "", password: "" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.error || "فشل التسجيل" });
    } finally {
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
            {["✅ مخزون جاهز للبيع","🚚 توصيل سريع لكل المدن","💰 أرباح تُسحب فوراً"].map(t => (
              <div key={t} className="bg-white/10 rounded-xl px-5 py-3 text-white text-sm font-bold text-right">{t}</div>
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
            <h2 className="text-2xl font-black text-[#1E293B] mb-1">إنشاء حساب جديد 🚀</h2>
            <p className="text-slate-400 text-sm mb-8">أدخل بياناتك وسيتم مراجعة طلبك</p>

            {message.text && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-bold text-center border ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border-green-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}>
                {message.type === "success" ? "✅ " : "⚠️ "}{message.text}
              </div>
            )}

            {message.type !== "success" && (
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
