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
      setFormData({ name: "", email: "", phone: "", password: "" }); // تصفير النموذج
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.error || "فشل التسجيل" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">انضم كبائع جديد 🚀</h2>

        {message.text && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-bold text-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {message.type !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">الاسم الكامل</label>
              <input 
                className="w-full border p-3 rounded-lg bg-gray-50 focus:bg-white transition" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
              <input 
                type="email" 
                className="w-full border p-3 rounded-lg bg-gray-50 focus:bg-white transition" 
                required 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
              <input 
                className="w-full border p-3 rounded-lg bg-gray-50 focus:bg-white transition" 
                required 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">كلمة المرور</label>
              <input 
                type="password" 
                className="w-full border p-3 rounded-lg bg-gray-50 focus:bg-white transition" 
                required 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400"
            >
              {loading ? "جاري التسجيل..." : "تسجيل حساب جديد"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          لديك حساب بالفعل؟ <Link href="/login" className="text-blue-600 font-bold hover:underline">سجل الدخول</Link>
        </div>
      </div>
    </div>
  );
}