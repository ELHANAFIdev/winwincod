"use client";
import { useState, useRef, useEffect } from "react";
import { moroccoCities } from "@/data/moroccoCities";

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
  error?: boolean;
}

export default function CitySelector({ value, onChange, error }: CitySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const filteredCities = moroccoCities.filter((city) =>
    city.includes(searchTerm)
  );

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative w-full" dir="rtl">
      <div
        onClick={() => setIsOpen((v) => !v)}
        className={`w-full border ${error ? "border-red-400 bg-red-50" : "border-[#E2E8F0] bg-[#F8FAFC]"} focus:border-[#4361EE] p-3.5 rounded-xl cursor-pointer flex justify-between items-center transition text-sm font-medium`}
      >
        <span className={value ? "text-[#1E293B]" : "text-slate-400"}>
          {value || "اختر مدينتك..."}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-lg max-h-60 overflow-y-auto">
          <input
            autoFocus
            type="text"
            placeholder="اكتب اسم المدينة هنا..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border-b border-[#E2E8F0] focus:outline-none text-sm sticky top-0 bg-white"
          />

          {filteredCities.length > 0 ? (
            filteredCities.map((city) => (
              <div
                key={city}
                onClick={() => {
                  onChange(city);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                className="p-3 text-sm text-[#1E293B] font-medium hover:bg-blue-50 hover:text-[#4361EE] cursor-pointer transition-colors"
              >
                {city}
              </div>
            ))
          ) : (
            <div className="p-3 text-sm text-slate-400 text-center">
              لم يتم العثور على هذه المدينة
            </div>
          )}
        </div>
      )}
    </div>
  );
}
