"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const PERIODS = [
  { key: "today",  label: "اليوم" },
  { key: "week",   label: "هذا الأسبوع" },
  { key: "month",  label: "هذا الشهر" },
  { key: "year",   label: "هذه السنة" },
  { key: "custom", label: "تاريخ مخصص" },
];

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function rangeFor(key: string): { from: string; to: string } {
  const now = new Date();
  const today = fmt(now);
  if (key === "today") return { from: today, to: today };
  if (key === "week") {
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    return { from: fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff)), to: today };
  }
  if (key === "year") return { from: `${now.getFullYear()}-01-01`, to: today };
  // month (default)
  return {
    from: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
    to: today,
  };
}

export default function DateFilter({
  period,
  from,
  to,
}: {
  period: string;
  from: string;
  to: string;
}) {
  const router = useRouter();
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);

  const go = (key: string, f?: string, t?: string) => {
    const range = key === "custom" ? { from: f!, to: t! } : rangeFor(key);
    router.push(`?period=${key}&from=${range.from}&to=${range.to}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4" dir="rtl">
      {/* Quick period buttons */}
      <div className="flex flex-wrap gap-2">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() =>
              key === "custom"
                ? go("custom", customFrom, customTo)
                : go(key)
            }
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              period === key
                ? "bg-[#4361EE] text-white shadow-sm"
                : "bg-[#F8FAFC] text-slate-500 hover:bg-[#EEF2FF] hover:text-[#4361EE] border border-[#E2E8F0]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Custom date pickers — only shown when period === "custom" */}
      {period === "custom" && (
        <div className="flex flex-wrap items-end gap-3 mt-4 pt-4 border-t border-[#E2E8F0]">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">من</label>
            <input
              type="date"
              value={customFrom}
              max={customTo}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4361EE] bg-[#F8FAFC] transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">إلى</label>
            <input
              type="date"
              value={customTo}
              min={customFrom}
              onChange={(e) => setCustomTo(e.target.value)}
              className="border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4361EE] bg-[#F8FAFC] transition"
            />
          </div>
          <button
            onClick={() => go("custom", customFrom, customTo)}
            disabled={!customFrom || !customTo}
            className="bg-[#4361EE] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#3254D4] transition disabled:opacity-50"
          >
            تطبيق
          </button>
        </div>
      )}
    </div>
  );
}
