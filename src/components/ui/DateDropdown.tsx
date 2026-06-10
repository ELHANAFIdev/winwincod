"use client";
import { useState, useEffect, useRef } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────
export function fmtDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function rangeFor(key: string): { from: string; to: string } {
  const now = new Date();
  const today = fmtDate(now);
  if (key === "all") return { from: "2020-01-01", to: today };
  if (key === "today") return { from: today, to: today };
  if (key === "yesterday") {
    const y = fmtDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
    return { from: y, to: y };
  }
  if (key === "7d")
    return {
      from: fmtDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6)),
      to: today,
    };
  if (key === "30d")
    return {
      from: fmtDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29)),
      to: today,
    };
  if (key === "lastmonth")
    return {
      from: fmtDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      to: fmtDate(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
  // "month" — default
  return {
    from: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
    to: today,
  };
}

export const PERIOD_LABELS: Record<string, string> = {
  all: "منذ البداية",
  today: "اليوم",
  yesterday: "أمس",
  "7d": "آخر 7 أيام",
  "30d": "آخر 30 يوم",
  month: "هذا الشهر",
  lastmonth: "الشهر الماضي",
  custom: "تاريخ مخصص",
};

const QUICK_OPTIONS = [
  { key: "all", label: "منذ البداية" },
  { key: "today", label: "اليوم" },
  { key: "yesterday", label: "أمس" },
  { key: "7d", label: "آخر 7 أيام" },
  { key: "30d", label: "آخر 30 يوم" },
  { key: "month", label: "هذا الشهر" },
  { key: "lastmonth", label: "الشهر الماضي" },
];

// ── component ─────────────────────────────────────────────────────────────────
interface Props {
  period: string;
  from: string;
  to: string;
  onChange: (period: string, from: string, to: string) => void;
}

export default function DateDropdown({ period, from, to, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);
  const containerRef = useRef<HTMLDivElement>(null);

  // sync custom inputs when parent period/dates change
  useEffect(() => {
    setCustomFrom(from);
    setCustomTo(to);
  }, [from, to]);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (key: string) => {
    const range = rangeFor(key);
    onChange(key, range.from, range.to);
    setOpen(false);
  };

  const applyCustom = () => {
    if (!customFrom || !customTo) return;
    onChange("custom", customFrom, customTo);
    setOpen(false);
  };

  const label = PERIOD_LABELS[period] ?? "هذا الشهر";

  return (
    <div ref={containerRef} className="relative" dir="rtl">
      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full sm:w-auto items-center justify-between gap-3 bg-white border rounded-xl px-4 py-2.5 text-sm font-bold text-[#1E293B] shadow-sm transition-all duration-150 sm:min-w-[200px]
          ${open
            ? "border-[#4361EE] shadow-md ring-2 ring-[#4361EE]/10"
            : "border-[#E2E8F0] hover:border-[#4361EE] hover:shadow-md"
          }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="text-base leading-none flex-shrink-0">📅</span>
          <span className="truncate">{label}</span>
          {period === "custom" && (
            <span className="hidden md:inline text-[10px] font-mono text-slate-400 truncate">
              {from.slice(5)} → {to.slice(5)}
            </span>
          )}
        </span>
        <span
          className="text-slate-400 flex-shrink-0 text-[10px] transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>

      {/* ── Dropdown panel ── */}
      <div
        className="absolute top-[calc(100%+6px)] right-0 z-50 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl shadow-slate-300/40 w-full sm:w-64 overflow-hidden"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scaleY(1)" : "translateY(-6px) scaleY(0.96)",
          transformOrigin: "top right",
          transition: "opacity 180ms ease, transform 180ms ease",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {/* Quick options */}
        <div className="p-2">
          {QUICK_OPTIONS.map(({ key, label: optLabel }) => (
            <button
              key={key}
              onClick={() => select(key)}
              className={`w-full text-right px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors duration-100 flex items-center justify-between gap-2
                ${period === key
                  ? "bg-[#4361EE] text-white shadow-sm"
                  : "text-[#1E293B] hover:bg-[#F8FAFC]"
                }`}
            >
              <span>{optLabel}</span>
              {period === key && (
                <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded font-black">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Custom date range */}
        <div className="border-t border-[#E2E8F0] p-3 bg-[#F8FAFC]">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <span>🗓️</span> تاريخ مخصص
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 w-5 flex-shrink-0 text-center">من</span>
              <input
                type="date"
                value={customFrom}
                max={customTo || undefined}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="flex-1 border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#4361EE] bg-white transition min-w-0"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 w-5 flex-shrink-0 text-center">إلى</span>
              <input
                type="date"
                value={customTo}
                min={customFrom || undefined}
                onChange={(e) => setCustomTo(e.target.value)}
                className="flex-1 border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#4361EE] bg-white transition min-w-0"
              />
            </div>
            <div className="flex gap-2 pt-0.5">
              <button
                onClick={applyCustom}
                disabled={!customFrom || !customTo}
                className="flex-1 bg-[#4361EE] hover:bg-[#3254D4] text-white py-2 rounded-xl text-xs font-bold transition disabled:opacity-50 shadow-sm"
              >
                تطبيق
              </button>
              <button
                onClick={() => select("month")}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 bg-white border border-[#E2E8F0] hover:bg-slate-50 transition"
                title="إعادة تعيين لهذا الشهر"
              >
                ↺
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
