"use client";
import { useState, useId } from "react";
import axios from "axios";
import { Camera } from "lucide-react";

export default function ImageUpload({ value, onSuccess }: { value: string; onSuccess: (url: string) => void }) {
  const [loading, setLoading] = useState(false);
  const inputId = useId();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("/api/upload", formData);
      onSuccess(res.data.url);
    } catch {
      alert("فشل رفع الصورة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-[#E2E8F0] hover:border-[#4361EE] rounded-2xl p-4 h-48 flex items-center justify-center relative bg-[#F8FAFC] overflow-hidden group transition-colors">
      {loading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin h-8 w-8 border-2 border-[#4361EE] border-t-transparent rounded-full"></div>
          <p className="text-xs text-[#4361EE] font-bold">جاري الرفع...</p>
        </div>
      ) : value ? (
        <div className="absolute inset-0 group">
          <img src={value} className="w-full h-full object-contain" alt="Product" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-2xl">
            <label htmlFor={inputId} className="cursor-pointer bg-white text-[#1E293B] px-4 py-2 rounded-xl font-bold text-sm shadow-sm">
              تغيير الصورة
            </label>
          </div>
        </div>
      ) : (
        <label htmlFor={inputId} className="flex flex-col items-center cursor-pointer text-slate-400 hover:text-[#4361EE] transition gap-2">
          <Camera className="w-10 h-10 text-slate-300 mx-auto" />
          <span className="text-sm font-bold">اضغط هنا لرفع صورة</span>
          <span className="text-[10px] text-slate-300">PNG, JPG (Max 5MB)</span>
        </label>
      )}
      <input id={inputId} type="file" className="hidden" accept="image/*" onChange={handleUpload} />
    </div>
  );
}
