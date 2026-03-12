"use client";

import { signIn, getSession } from "next-auth/react"; // 👈 أضفنا getSession
import { useState } from "react";
import { useRouter } from "next/navigation";

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

    // 1. محاولة تسجيل الدخول
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("البريد الإلكتروني أو كلمة المرور خطأ");
      setLoading(false);
    } else {
      // 2. إذا نجح الدخول، نجلب بيانات الجلسة لنعرف الرتبة
      const session = await getSession();
      
      // 3. التوجيه حسب الرتبة
      if (session?.user?.role === "CALL_CENTER") {
        window.location.href = "/call-center/dashboard";
      } else if (session?.user?.role === "ADMIN") {
        window.location.href = "/admin/dashboard"; // سنبنيها لاحقاً
      } else {
        // الافتراضي للبائع
        window.location.href = "/seller/dashboard";
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-96 border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">تسجيل الدخول</h1>
        
        {error && <div className="bg-red-50 text-red-600 p-3 mb-4 rounded-lg text-sm border border-red-100">{error}</div>}
        
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">البريد الإلكتروني</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="name@example.com"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium text-gray-700">كلمة المرور</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="••••••"
            required
          />
        </div>
        
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2.5 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-blue-400"
        >
          {loading ? "جاري التحقق..." : "دخول"}
        </button>
      </form>
    </div>
  );
}