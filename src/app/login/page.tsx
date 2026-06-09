"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
    } else {
      const session = await getSession();
      if (session?.user?.role === "CALL_CENTER") window.location.href = "/call-center/dashboard";
      else if (session?.user?.role === "ADMIN") window.location.href = "/admin/dashboard";
      else window.location.href = "/seller/dashboard";
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
            منصة إدارة الطلبات والدفع عند التسليم للبائعين المغاربة
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[["📦","طلبات"],["🚚","توصيل"],["💰","أرباح"]].map(([icon, label]) => (
              <div key={label} className="bg-white/10 rounded-2xl p-4">
                <div className="text-2xl mb-1">{icon}</div>
                <p className="text-white/80 text-xs font-bold">{label}</p>
              </div>
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
            <h2 className="text-2xl font-black text-[#1E293B] mb-1">مرحباً بعودتك 👋</h2>
            <p className="text-slate-400 text-sm mb-8">سجل دخولك للوصول إلى لوحتك</p>

            {error && (
              <div className="bg-red-50 text-red-600 p-3.5 mb-6 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#1E293B] mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-200 focus:border-[#4361EE] p-3.5 rounded-xl outline-none transition text-[#1E293B] bg-[#F8FAFC] focus:bg-white"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1E293B] mb-2">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-gray-200 focus:border-[#4361EE] p-3.5 rounded-xl outline-none transition text-[#1E293B] bg-[#F8FAFC] focus:bg-white"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4361EE] hover:bg-[#3254D4] text-white py-3.5 rounded-xl font-bold transition shadow-sm disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    جاري التحقق...
                  </span>
                ) : "تسجيل الدخول"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              ليس لديك حساب؟{" "}
              <Link href="/register" className="text-[#4361EE] font-bold hover:underline">
                انضم الآن
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
