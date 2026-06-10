"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DateFilter({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const [fromVal, setFromVal] = useState(from);
  const [toVal, setToVal] = useState(to);

  const apply = () => {
    if (!fromVal || !toVal) return;
    router.push(`/admin/dashboard?from=${fromVal}&to=${toVal}`);
  };

  const reset = () => {
    const now = new Date();
    const f = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const t = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setFromVal(f);
    setToVal(t);
    router.push("/admin/dashboard");
  };

  return (
    <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 shadow-sm">
      <span className="text-slate-400 text-sm select-none">📅</span>
      <input
        type="date"
        value={fromVal}
        max={toVal}
        onChange={(e) => setFromVal(e.target.value)}
        className="outline-none text-[#1E293B] bg-transparent text-sm w-32"
      />
      <span className="text-slate-300 font-bold text-xs select-none">—</span>
      <input
        type="date"
        value={toVal}
        min={fromVal}
        onChange={(e) => setToVal(e.target.value)}
        className="outline-none text-[#1E293B] bg-transparent text-sm w-32"
      />
      <div className="flex items-center gap-1 mr-1">
        <button
          onClick={apply}
          className="bg-[#4361EE] hover:bg-[#3254D4] text-white text-xs px-3 py-1.5 rounded-lg font-bold transition shadow-sm"
        >
          تطبيق
        </button>
        <button
          onClick={reset}
          className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] transition"
          title="إعادة ضبط"
        >
          ↺
        </button>
      </div>
    </div>
  );
}
