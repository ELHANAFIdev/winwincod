"use client";
import { useState } from "react";
import axios from "axios";
import { signIn } from "next-auth/react";
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
      setFormData({ name: "", email: "", phone: "", password: "" }); // تصفير النموذج
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.error || "فشل التسجيل" });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: any) => {
    // Keep only digits
    const digits = e.target.value.replace(/\D/g, "");
    setFormData({...formData, phone: digits});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" style={{ backgroundImage: "url('/pattern.svg')", backgroundSize: "cover" }}>
      <div className="glass-panel p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 relative overflow-hidden">
        {/* Subtle glow effect behind */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>
        <h2 className="text-3xl font-extrabold text-center mb-6 text-[var(--gold-accent)] drop-shadow-md">انضم كبائع جديد 🚀</h2>

        {message.text && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-bold text-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {message.type !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">الاسم الكامل</label>
              <input 
                className="w-full border border-white/20 p-3 rounded-lg bg-black/30 text-white focus:bg-black/50 transition outline-none focus:ring-1 focus:ring-[var(--gold-accent)]" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">البريد الإلكتروني</label>
              <input 
                type="email" 
                className="w-full border border-white/20 p-3 rounded-lg bg-black/30 text-white focus:bg-black/50 transition outline-none focus:ring-1 focus:ring-[var(--gold-accent)]" 
                required 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">رقم الهاتف</label>
              <div className="flex" dir="ltr">
                <span className="inline-flex items-center px-3 text-sm text-gray-300 bg-black/40 border border-r-0 border-white/20 rounded-l-md">
                  +212
                </span>
                <input 
                  type="tel"
                  className="w-full border-white/20 p-3 rounded-r-md bg-black/30 text-white focus:bg-black/50 transition outline-none border focus:ring-1 focus:ring-[var(--gold-accent)]" 
                  required 
                  placeholder="612345678"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  maxLength={9}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">كلمة المرور</label>
              <input 
                type="password" 
                className="w-full border border-white/20 p-3 rounded-lg bg-black/30 text-white focus:bg-black/50 transition outline-none focus:ring-1 focus:ring-[var(--gold-accent)]" 
                required 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-black py-3 rounded-lg font-bold hover:from-yellow-500 hover:to-yellow-400 transition shadow-lg shadow-yellow-500/20 disabled:opacity-50"
            >
              {loading ? "جاري التسجيل..." : "تسجيل حساب جديد"}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/20"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">أو</span>
              <div className="flex-grow border-t border-white/20"></div>
            </div>

            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); signIn("google", { callbackUrl: "/seller/dashboard" }); }}
              className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white py-3 rounded-lg font-bold hover:bg-white/10 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              التسجيل بواسطة Google
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          لديك حساب بالفعل؟ <Link href="/login" className="text-[var(--gold-accent)] font-bold hover:underline">سجل الدخول</Link>
        </div>
      </div>
    </div>
  );
}