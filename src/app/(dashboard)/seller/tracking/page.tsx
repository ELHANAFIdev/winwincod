"use client";
import { useState, useRef, useEffect, type ReactNode } from "react";
import axios from "axios";
import {
  Search, AlertTriangle, Package, ClipboardList, Phone,
  Truck, CheckCircle, RotateCcw, XCircle, User, DollarSign,
  CalendarDays, Ship
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus =
  | "DRAFT" | "PENDING_CONFIRMATION" | "CONFIRMED" | "WAITING_PAYMENT"
  | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";

interface StatusEntry { status: OrderStatus; createdAt: string }

interface OrderData {
  id: string; ref: string; seqId: number | null;
  customerName: string; customerPhone: string;
  productName: string; quantity: number; codAmount: number;
  city: string; address: string;
  status: OrderStatus; trackingNumber: string | null;
  createdAt: string; updatedAt: string;
  statusHistory: StatusEntry[];
}

// ─── CSS-only constants ───────────────────────────────────────────────────────

const STATUS_CSS: Record<OrderStatus, { color: string; bg: string; border: string }> = {
  DRAFT:                { color: "text-slate-600",  bg: "bg-slate-100",  border: "border-slate-200"  },
  PENDING_CONFIRMATION: { color: "text-yellow-700", bg: "bg-yellow-50",  border: "border-yellow-200" },
  CONFIRMED:            { color: "text-[#4361EE]",  bg: "bg-[#EEF2FF]",  border: "border-blue-200"   },
  WAITING_PAYMENT:      { color: "text-purple-700", bg: "bg-purple-50",  border: "border-purple-200" },
  PROCESSING:           { color: "text-[#FB923C]",  bg: "bg-orange-50",  border: "border-orange-200" },
  SHIPPED:              { color: "text-cyan-700",   bg: "bg-cyan-50",    border: "border-cyan-200"   },
  DELIVERED:            { color: "text-green-700",  bg: "bg-green-50",   border: "border-green-200"  },
  CANCELLED:            { color: "text-slate-500",  bg: "bg-slate-100",  border: "border-slate-200"  },
  RETURNED:             { color: "text-red-600",    bg: "bg-red-50",     border: "border-red-200"    },
};

// ─── Timeline step icons (no labels) ─────────────────────────────────────────

const STEP_ICONS = [
  <ClipboardList className="w-5 h-5" />,
  <Phone className="w-5 h-5" />,
  <Package className="w-5 h-5" />,
  <Truck className="w-5 h-5" />,
  <CheckCircle className="w-5 h-5" />,
];

const RETURNED_ICON = <RotateCcw className="w-5 h-5" />;
const CANCELLED_ICON = <XCircle className="w-5 h-5" />;

// Each step's "reached at" statuses — no labels needed here
const STEP_REACHED: readonly OrderStatus[][] = [
  ["DRAFT","PENDING_CONFIRMATION","CONFIRMED","WAITING_PAYMENT","PROCESSING","SHIPPED","DELIVERED","CANCELLED","RETURNED"],
  ["CONFIRMED","WAITING_PAYMENT","PROCESSING","SHIPPED","DELIVERED","RETURNED"],
  ["PROCESSING","SHIPPED","DELIVERED","RETURNED"],
  ["SHIPPED","DELIVERED","RETURNED"],
  ["DELIVERED"],
];

function getStepIndex(status: OrderStatus): number {
  if (status === "DRAFT") return 0;
  if (status === "PENDING_CONFIRMATION") return 1;
  if (status === "CONFIRMED" || status === "WAITING_PAYMENT") return 1;
  if (status === "PROCESSING") return 2;
  if (status === "SHIPPED") return 3;
  if (status === "DELIVERED" || status === "RETURNED" || status === "CANCELLED") return 4;
  return 0;
}

function getTimestampForStatus(history: StatusEntry[], statuses: readonly OrderStatus[]): string | null {
  for (const s of statuses) {
    const entry = history.find((h) => h.status === s);
    if (entry) return entry.createdAt;
  }
  return null;
}

function fmtDate(iso: string | null, lang: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "ar-MA", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Timeline component ───────────────────────────────────────────────────────

function TrackingTimeline({ order }: { order: OrderData }) {
  const { t, lang } = useLanguage();

  const STEP_LABELS = [
    { label: t("tracking.step1"), sub: t("tracking.step1sub"), icon: STEP_ICONS[0] },
    { label: t("tracking.step2"), sub: t("tracking.step2sub"), icon: STEP_ICONS[1] },
    { label: t("tracking.step3"), sub: t("tracking.step3sub"), icon: STEP_ICONS[2] },
    { label: t("tracking.step4"), sub: t("tracking.step4sub"), icon: STEP_ICONS[3] },
    { label: t("tracking.step5"), sub: t("tracking.step5sub"), icon: STEP_ICONS[4] },
  ];

  const RETURNED_STEP = { label: t("tracking.returned"),  sub: t("tracking.returnedSub"),  icon: RETURNED_ICON  };
  const CANCELLED_STEP = { label: t("tracking.cancelled"), sub: t("tracking.cancelledSub"), icon: CANCELLED_ICON };

  const isCancelled = order.status === "CANCELLED";
  const isReturned  = order.status === "RETURNED";
  const currentStep = getStepIndex(order.status);

  const stepsToRender = [
    ...STEP_LABELS.slice(0, 4),
    isCancelled ? CANCELLED_STEP : isReturned ? RETURNED_STEP : STEP_LABELS[4],
  ];

  const stepTimestamps = [
    order.createdAt,
    getTimestampForStatus(order.statusHistory, ["CONFIRMED", "WAITING_PAYMENT"]),
    getTimestampForStatus(order.statusHistory, ["PROCESSING"]),
    getTimestampForStatus(order.statusHistory, ["SHIPPED"]),
    getTimestampForStatus(order.statusHistory, ["DELIVERED", "RETURNED", "CANCELLED"]),
  ];

  return (
    <div className="relative">
      {stepsToRender.map((step, idx) => {
        const isDone    = idx < currentStep || (idx === currentStep && ["DELIVERED","CANCELLED","RETURNED"].includes(order.status));
        const isCurrent = idx === currentStep && !["DELIVERED","CANCELLED","RETURNED"].includes(order.status);
        const ts        = stepTimestamps[idx];

        return (
          <div key={idx} className="flex gap-4 relative">
            {idx < stepsToRender.length - 1 && (
              <div
                className={`absolute top-10 bottom-0 w-0.5 ${lang === "fr" ? "left-[19px]" : "right-[19px]"} ${
                  idx < currentStep ? "bg-[#4361EE]" : "bg-slate-200"
                }`}
                style={{ top: "40px", height: "calc(100% - 8px)" }}
              />
            )}

            <div className="relative z-10 flex-shrink-0">
              {isDone ? (
                <div className="w-10 h-10 rounded-full bg-[#4361EE] flex items-center justify-center shadow-md shadow-blue-200">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : isCurrent ? (
                <div className="w-10 h-10 rounded-full bg-[#FB923C] flex items-center justify-center shadow-md shadow-orange-200 relative text-white">
                  {step.icon}
                  <span className="absolute inset-0 rounded-full bg-[#FB923C]/40 animate-ping" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-300">
                  {step.icon}
                </div>
              )}
            </div>

            <div className={`pb-8 flex-1 pt-1.5 ${idx === stepsToRender.length - 1 ? "pb-0" : ""}`}>
              <p className={`font-black text-sm leading-tight ${
                isDone ? "text-[#1E293B]" : isCurrent ? "text-[#FB923C]" : "text-slate-400"
              }`}>
                {step.label}
              </p>
              <p className={`text-xs mt-0.5 ${isDone || isCurrent ? "text-slate-400" : "text-slate-300"}`}>
                {step.sub}
              </p>
              {ts && (isDone || isCurrent) && (
                <p className="text-[11px] text-[#4361EE] font-bold mt-1 bg-[#EEF2FF] px-2 py-0.5 rounded-md w-fit">
                  {fmtDate(ts, lang)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TrackingPage() {
  const { t, lang } = useLanguage();
  const [query, setQuery]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [order, setOrder]       = useState<OrderData | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const STATUS_LABELS: Record<OrderStatus, string> = {
    DRAFT:                t("tracking.statusNew"),
    PENDING_CONFIRMATION: t("tracking.statusPending"),
    CONFIRMED:            t("tracking.statusConfirmed"),
    WAITING_PAYMENT:      t("tracking.statusWaitingPayment"),
    PROCESSING:           t("tracking.statusProcessing"),
    SHIPPED:              t("tracking.statusShipped"),
    DELIVERED:            t("tracking.statusDelivered"),
    CANCELLED:            t("tracking.statusCancelled"),
    RETURNED:             t("tracking.statusReturned"),
  };

  const doSearch = async (q = query) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setSearched(false);
    try {
      const res = await axios.get(`/api/seller/tracking?q=${encodeURIComponent(trimmed)}`);
      setOrder(res.data.order);
      setSearched(true);
    } catch (err: any) {
      setError(err.response?.data?.error || (lang === "fr" ? "Erreur de recherche" : "حدث خطأ في البحث"));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") doSearch();
  };

  const statusCss = order ? STATUS_CSS[order.status] : null;
  const statusLabel = order ? STATUS_LABELS[order.status] : "";

  return (
    <div className="space-y-6 max-w-2xl mx-auto" dir={lang === "fr" ? "ltr" : "rtl"}>
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-[#1E293B] flex items-center gap-2">
          {t("tracking.title")}
        </h2>
        <p className="text-slate-400 text-sm mt-0.5">{t("tracking.subtitle")}</p>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 md:p-5">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Search className="w-4 h-4" /></span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t("tracking.search")}
              className="w-full pr-10 pl-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#4361EE] bg-[#F8FAFC] focus:bg-white transition font-medium placeholder:text-slate-400"
              disabled={loading}
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setOrder(null); setSearched(false); setError(null); inputRef.current?.focus(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={() => doSearch()}
            disabled={loading || !query.trim()}
            className="bg-[#4361EE] hover:bg-[#3254D4] disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 min-w-[100px] justify-center min-h-[48px]"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : t("tracking.searchBtn")}
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-[11px] text-slate-400 font-bold">{t("tracking.example")}</span>
          {["ORD-0001", "ORD-0023"].map((ex) => (
            <button
              key={ex}
              onClick={() => { setQuery(ex); doSearch(ex); }}
              className="text-[11px] text-[#4361EE] bg-[#EEF2FF] px-2 py-0.5 rounded-md font-bold hover:bg-[#4361EE] hover:text-white transition"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <p className="text-red-600 font-bold text-sm">{error}</p>
        </div>
      )}

      {/* Not found */}
      {searched && !order && !error && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] py-20 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-xl font-black text-[#1E293B] mb-2">{t("tracking.notFound")}</p>
          <p className="text-slate-400 text-sm">{t("tracking.notFoundDetails")}</p>
        </div>
      )}

      {/* Results */}
      {order && statusCss && (
        <div className="space-y-5">
          {/* Status badge */}
          <div className={`flex items-center gap-3 p-4 rounded-2xl border ${statusCss.bg} ${statusCss.border}`}>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400 mb-0.5">{t("tracking.currentStatus")}</p>
              <p className={`text-2xl font-black ${statusCss.color}`}>{statusLabel}</p>
            </div>
            <div className="opacity-80 text-slate-500">
              {order.status === "DELIVERED" ? <CheckCircle className="w-8 h-8 text-green-500" />
                : order.status === "RETURNED"  ? <RotateCcw className="w-8 h-8 text-red-500" />
                : order.status === "SHIPPED"   ? <Truck className="w-8 h-8 text-cyan-500" />
                : order.status === "PROCESSING"? <Package className="w-8 h-8 text-orange-400" />
                : order.status === "CONFIRMED" ? <Phone className="w-8 h-8 text-blue-500" />
                : order.status === "CANCELLED" ? <XCircle className="w-8 h-8 text-slate-400" />
                : <ClipboardList className="w-8 h-8 text-slate-400" />}
            </div>
          </div>

          {/* Order info card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <span className="font-black text-[#1E293B] text-sm">{t("tracking.orderInfo")}</span>
              <span className="font-mono text-xs text-slate-400 bg-white px-2 py-1 rounded-lg border border-[#E2E8F0]">
                {order.ref}
              </span>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={<User className="w-5 h-5" />}        label={t("tracking.customer")}       value={order.customerName} />
              <InfoRow icon={<Phone className="w-5 h-5" />}       label={t("tracking.phone")}          value={order.customerPhone} isPhone />
              <InfoRow icon={<Package className="w-5 h-5" />}     label={t("tracking.product")}        value={`${order.productName} × ${order.quantity}`} />
              <InfoRow icon={<DollarSign className="w-5 h-5" />}  label={t("tracking.amount")}         value={`${order.codAmount.toFixed(0)} ${lang === "fr" ? "MAD" : "درهم"}`} highlight />
              <InfoRow icon={<Search className="w-5 h-5" />}      label={t("tracking.city")}           value={order.city} />
              <InfoRow icon={<CalendarDays className="w-5 h-5" />} label={t("tracking.createdAt")}     value={fmtDate(order.createdAt, lang)} />
              {order.trackingNumber && (
                <InfoRow icon={<Ship className="w-5 h-5" />} label={t("tracking.trackingNumber")} value={order.trackingNumber} mono />
              )}
            </div>
          </div>

          {/* Tracking timeline */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <span className="font-black text-[#1E293B] text-sm">{t("tracking.orderPath")}</span>
            </div>
            <div className="p-5">
              <TrackingTimeline order={order} />
            </div>
          </div>
        </div>
      )}

      {/* Initial empty state */}
      {!searched && !loading && !error && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] py-16 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-lg font-black text-[#1E293B] mb-1">{t("tracking.trackOrders")}</p>
          <p className="text-slate-400 text-sm">{t("tracking.enterToSearch")}</p>
        </div>
      )}
    </div>
  );
}

// ─── Info row ──────────────────────────────────────────────────────────────────

function InfoRow({
  icon, label, value, highlight, isPhone, mono,
}: {
  icon: ReactNode; label: string; value: string;
  highlight?: boolean; isPhone?: boolean; mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-slate-400 flex-shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        {isPhone ? (
          <a href={`tel:${value}`} className="font-bold text-sm text-[#4361EE] hover:underline font-mono">
            {value}
          </a>
        ) : (
          <p className={`font-bold text-sm break-words ${
            highlight ? "text-[#4361EE] text-base" : "text-[#1E293B]"
          } ${mono ? "font-mono text-xs bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 w-fit" : ""}`}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
