"use client";
import { useState, useRef, useEffect, type ReactNode } from "react";
import axios from "axios";
import {
  Search, AlertTriangle, Package, ClipboardList, Phone,
  Truck, CheckCircle, RotateCcw, XCircle, User, DollarSign,
  CalendarDays, Ship
} from "lucide-react";

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

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; border: string }> = {
  DRAFT:                { label: "جديد",             color: "text-slate-600",  bg: "bg-slate-100",   border: "border-slate-200" },
  PENDING_CONFIRMATION: { label: "بانتظار التأكيد",  color: "text-yellow-700", bg: "bg-yellow-50",   border: "border-yellow-200" },
  CONFIRMED:            { label: "تم التأكيد",       color: "text-[#4361EE]",  bg: "bg-[#EEF2FF]",   border: "border-blue-200" },
  WAITING_PAYMENT:      { label: "بانتظار الدفع",    color: "text-purple-700", bg: "bg-purple-50",   border: "border-purple-200" },
  PROCESSING:           { label: "قيد التجهيز",      color: "text-[#FB923C]",  bg: "bg-orange-50",   border: "border-orange-200" },
  SHIPPED:              { label: "في الطريق",         color: "text-cyan-700",   bg: "bg-cyan-50",     border: "border-cyan-200" },
  DELIVERED:            { label: "تم التسليم",       color: "text-green-700",  bg: "bg-green-50",    border: "border-green-200" },
  CANCELLED:            { label: "ملغي",              color: "text-slate-500",  bg: "bg-slate-100",   border: "border-slate-200" },
  RETURNED:             { label: "مرتجع",             color: "text-red-600",    bg: "bg-red-50",      border: "border-red-200" },
};

// ─── Timeline definition ──────────────────────────────────────────────────────

interface TimelineStep {
  id: number;
  icon: ReactNode;
  label: string;
  sub: string;
  reachedAt: readonly OrderStatus[];
}

const STEPS: TimelineStep[] = [
  {
    id: 0,
    icon: <ClipboardList className="w-5 h-5" />,
    label: "تم إنشاء الطلب",
    sub: "تم تسجيل الطلب في المنصة",
    reachedAt: [
      "DRAFT","PENDING_CONFIRMATION","CONFIRMED","WAITING_PAYMENT",
      "PROCESSING","SHIPPED","DELIVERED","CANCELLED","RETURNED",
    ],
  },
  {
    id: 1,
    icon: <Phone className="w-5 h-5" />,
    label: "تم التأكيد مع العميل",
    sub: "تأكيد الطلب مع العميل بنجاح",
    reachedAt: ["CONFIRMED","WAITING_PAYMENT","PROCESSING","SHIPPED","DELIVERED","RETURNED"],
  },
  {
    id: 2,
    icon: <Package className="w-5 h-5" />,
    label: "تم تسليم الطلب للشركة",
    sub: "الطلب جاهز للشحن مع شركة Ozon",
    reachedAt: ["PROCESSING","SHIPPED","DELIVERED","RETURNED"],
  },
  {
    id: 3,
    icon: <Truck className="w-5 h-5" />,
    label: "الطلب في الطريق",
    sub: "الطلب خرج من المستودع نحو العميل",
    reachedAt: ["SHIPPED","DELIVERED","RETURNED"],
  },
  {
    id: 4,
    icon: <CheckCircle className="w-5 h-5" />,
    label: "تم التسليم",
    sub: "تم تسليم الطلب للعميل بنجاح",
    reachedAt: ["DELIVERED"],
  },
];

// Returned and Cancelled get their own last step
const RETURNED_STEP = { id: 4, icon: <RotateCcw className="w-5 h-5" />, label: "مرتجع", sub: "رُفض أو أُعيد الطلب" };
const CANCELLED_STEP = { id: 4, icon: <XCircle className="w-5 h-5" />, label: "ملغي", sub: "تم إلغاء الطلب" };

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

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ar-MA", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Timeline component ───────────────────────────────────────────────────────

function TrackingTimeline({ order }: { order: OrderData }) {
  const isCancelled = order.status === "CANCELLED";
  const isReturned  = order.status === "RETURNED";
  const currentStep = getStepIndex(order.status);

  const stepsToRender = [
    ...STEPS.slice(0, 4),
    isCancelled ? CANCELLED_STEP : isReturned ? RETURNED_STEP : STEPS[4],
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
            {/* Connector line */}
            {idx < stepsToRender.length - 1 && (
              <div
                className={`absolute top-10 bottom-0 w-0.5 right-[19px] ${
                  idx < currentStep ? "bg-[#4361EE]" : "bg-slate-200"
                }`}
                style={{ top: "40px", height: "calc(100% - 8px)" }}
              />
            )}

            {/* Circle */}
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

            {/* Content */}
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
                  {fmtDate(ts)}
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
  const [query, setQuery]   = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [order, setOrder]   = useState<OrderData | null>(null);
  const [error, setError]   = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const search = async (q = query) => {
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
      setError(err.response?.data?.error || "حدث خطأ في البحث");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") search();
  };

  const statusMeta = order ? STATUS_META[order.status] : null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto" dir="rtl">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-[#1E293B] flex items-center gap-2">تتبع الطلبات <Search className="w-5 h-5 text-slate-400" /></h2>
        <p className="text-slate-400 text-sm mt-0.5">ابحث برقم الطلب أو رقم هاتف العميل</p>
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
              placeholder="ORD-1234 أو رقم الهاتف..."
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
            onClick={() => search()}
            disabled={loading || !query.trim()}
            className="bg-[#4361EE] hover:bg-[#3254D4] disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 min-w-[100px] justify-center min-h-[48px]"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : "بحث"}
          </button>
        </div>

        {/* Quick examples */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-[11px] text-slate-400 font-bold">مثال:</span>
          {["ORD-0001", "ORD-0023"].map((ex) => (
            <button
              key={ex}
              onClick={() => { setQuery(ex); search(ex); }}
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
          <p className="text-xl font-black text-[#1E293B] mb-2">لم يتم العثور على الطلب</p>
          <p className="text-slate-400 text-sm">تأكد من رقم الطلب أو رقم الهاتف وحاول مجددًا</p>
        </div>
      )}

      {/* Results */}
      {order && statusMeta && (
        <div className="space-y-5">
          {/* Status badge */}
          <div className={`flex items-center gap-3 p-4 rounded-2xl border ${statusMeta.bg} ${statusMeta.border}`}>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400 mb-0.5">الحالة الحالية</p>
              <p className={`text-2xl font-black ${statusMeta.color}`}>{statusMeta.label}</p>
            </div>
            <div className="opacity-80 text-slate-500">
              {order.status === "DELIVERED" ? <CheckCircle className="w-8 h-8 text-green-500" />
                : order.status === "RETURNED" ? <RotateCcw className="w-8 h-8 text-red-500" />
                : order.status === "SHIPPED" ? <Truck className="w-8 h-8 text-cyan-500" />
                : order.status === "PROCESSING" ? <Package className="w-8 h-8 text-orange-400" />
                : order.status === "CONFIRMED" ? <Phone className="w-8 h-8 text-blue-500" />
                : order.status === "CANCELLED" ? <XCircle className="w-8 h-8 text-slate-400" />
                : <ClipboardList className="w-8 h-8 text-slate-400" />}
            </div>
          </div>

          {/* Order info card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <span className="font-black text-[#1E293B] text-sm">معلومات الطلب</span>
              <span className="font-mono text-xs text-slate-400 bg-white px-2 py-1 rounded-lg border border-[#E2E8F0]">
                {order.ref}
              </span>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={<User className="w-5 h-5" />} label="العميل" value={order.customerName} />
              <InfoRow icon={<Phone className="w-5 h-5" />} label="الهاتف" value={order.customerPhone} isPhone />
              <InfoRow icon={<Package className="w-5 h-5" />} label="المنتج" value={`${order.productName} × ${order.quantity}`} />
              <InfoRow icon={<DollarSign className="w-5 h-5" />} label="مبلغ COD" value={`${order.codAmount.toFixed(0)} درهم`} highlight />
              <InfoRow icon={<Search className="w-5 h-5" />} label="المدينة" value={order.city} />
              <InfoRow icon={<CalendarDays className="w-5 h-5" />} label="تاريخ الإنشاء" value={fmtDate(order.createdAt)} />
              {order.trackingNumber && (
                <InfoRow icon={<Ship className="w-5 h-5" />} label="رقم التتبع" value={order.trackingNumber} mono />
              )}
            </div>
          </div>

          {/* Tracking timeline */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <span className="font-black text-[#1E293B] text-sm">تتبع مسار الطلب</span>
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
          <p className="text-lg font-black text-[#1E293B] mb-1">تتبع طلباتك</p>
          <p className="text-slate-400 text-sm">أدخل رقم الطلب أو هاتف العميل للبحث</p>
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
          <a
            href={`tel:${value}`}
            className="font-bold text-sm text-[#4361EE] hover:underline font-mono"
          >
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
