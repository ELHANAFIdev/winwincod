"use client";
import { useState, useId } from "react";
import axios from "axios";

export default function ImageUpload({ value, onSuccess }: { value: string, onSuccess: (url: string) => void }) {
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
    } catch (err) {
      alert("فشل رفع الصورة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 h-48 flex items-center justify-center relative bg-gray-50 overflow-hidden group">
      {loading ? (
        <div className="flex flex-col items-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mb-2"></div>
            <p className="text-xs text-blue-600 font-bold">جاري الرفع لسحابة Cloudinary...</p>
        </div>
      ) : value ? (
        <div className="absolute inset-0 group">
          <img src={value} className="w-full h-full object-contain" alt="Product" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <label htmlFor={inputId} className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg font-bold text-sm">تغيير الصورة</label>
          </div>
        </div>
      ) : (
        <label htmlFor={inputId} className="flex flex-col items-center cursor-pointer hover:text-blue-600 transition">
          <span className="text-4xl mb-2">📸</span>
          <span className="text-sm font-bold">اضغط هنا لرفع صورة المنتج</span>
          <span className="text-[10px] text-gray-400 mt-1">PNG, JPG (Max 5MB)</span>
        </label>
      )}
      <input id={inputId} type="file" className="hidden" accept="image/*" onChange={handleUpload} />
    </div>
  );
}