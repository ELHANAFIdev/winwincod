"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DateDropdown from "@/components/ui/DateDropdown";

interface Order {
  id: string;
  seqId: number | null;
  customerName: string;
  customerPhone: string;
  productName: string;
  quantity: number;
  codAmount: number;
  netProfit: number;
  status: string;
  trackingNumber: string | null;
  city: string;
  createdAt: string;
}

interface TodayStats {
  new: number;
  shipped: number;
  delivered: number;
  returned: number;
  profit: number;
}

interface Props {
  orders: Order[];
  todayStats: TodayStats;
  period: string;
  from: string;
  to: string;
  periodLabel: string;
}

const STATUS: Record<string, { label: string; bg: string; dot: string }> = {
  DRAFT:                { label: "جديد",             bg: "bg-slate-100 text-slate-600",                       dot: "bg-slate-400" },
  PENDING_CONFIRMATION: { label: "بانتظار التأكيد",  bg: "bg-yellow-50 text-yellow-700 border border-yellow-200", dot: "bg-yellow-500" },
  CONFIRMED:            { label: "مؤكد",              bg: "bg-[#EEF2FF] text-[#4361EE] border border-blue-100",   dot: "bg-[#4361EE]"  },
  WAITING_PAYMENT:      { label: "بانتظار الدفع",    bg: "bg-purple-50 text-purple-700 border border-purple-100", dot: "bg-purple-500" },
  PROCESSING:           { label: "قيد التجهيز",      bg: "bg-orange-50 text-[#FB923C] border border-orange-100",  dot: "bg-[#FB923C]"  },
  SHIPPED:              { label: "في الطريق",         bg: "bg-cyan-50 text-cyan-700 border border-cyan-100",       dot: "bg-cyan-500"   },
  DELIVERED:            { label: "تم التسليم",       bg: "bg-green-50 text-green-700 border border-green-100",    dot: "bg-green-500"  },
  CANCELLED:            { label: "ملغي",              bg: "bg-slate-100 text-slate-500",                           dot: "bg-slate-400"  },
  RETURNED:             { label: "مرتجع",             bg: "bg-red-50 text-red-600 border border-red-100",          dot: "bg-red-500"    },
};

const TABS = [
  { key: "all",       label: "الكل",        statuses: Object.keys(STATUS) },
  { key: "new",       label: "جديد",        statuses: ["DRAFT", "PENDING_CONFIRMATION", "CONFIRMED", "WAITING_PAYMENT", "PROCESSING"] },
  { key: "transit",   label: "في الطريق",   statuses: ["SHIPPED"] },
  { key: "delivered", label: "تم التسليم",  statuses: ["DELIVERED"] },
  { key: "returned",  label: "مرتجع",       statuses: ["RETURNED", "CANCELLED"] },
];

const PER_PAGE = 20;

function fmtRef(id: string, seqId: number | null) {
  return seqId ? `ORD-${String(seqId).padStart(4, "0")}` : `ORD-${id.slice(0, 4).toUpperCase()}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ar-MA", { day: "numeric", month: "short" });
}

function StatusBadge({
  order,
  openId,
  updatingId,
  onToggle,
  onSelect,
  dropdownSide = "right",
}: {
  order: Order;
  openId: string | null;
  updatingId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string, status: string) => void;
  dropdownSide?: "right" | "left";
}) {
  const sc = STATUS[order.status] ?? { label: order.status, bg: "bg-gray-100 text-gray-500", dot: "bg-gray-400" };
  const isOpen = openId === order.id;
  const isUpdating = updatingId === order.id;

  return (
    <div className="relative inline-block" data-dropdown="">
      <button
        onClick={() => onToggle(order.id)}
        disabled={isUpdating}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition hover:opacity-80 active:scale-95 ${sc.bg} ${isUpdating ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
      >
        {isUpdating ? (
          <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
        )}
        {isUpdating ? "جاري التحديث..." : sc.label}
        {!isUpdating && <span className="opacity-50 text-[9px] leading-none">▾</span>}
      </button>

      {isOpen && (
        <div className={`absolute top-full mt-1 z-50 bg-white border border-[#E2E8F0] rounded-xl shadow-xl overflow-hidden w-48 ${dropdownSide === "left" ? "left-0" : "right-0"}`}>
          {Object.entries(STATUS).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => onSelect(order.id, key)}
              className={`w-full text-right px-3 py-2 text-xs font-bold hover:bg-[#F8FAFC] transition flex items-center gap-2 ${
                order.status === key ? "bg-[#EEF2FF] text-[#4361EE]" : "text-[#1E293B]"
              }`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              {cfg.label}
              {order.status === key && <span className="mr-auto text-[10px] text-[#4361EE]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SellerOrdersClient({ orders: initial, todayStats, period, from, to, periodLabel }: Props) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initial);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => { setPage(1); }, [search, activeTab]);

  // Close status dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest("[data-dropdown]")) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setOpenDropdown(null);
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/seller/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const setTab = (tab: string) => { setActiveTab(tab); setPage(1); };

  const tabStatuses = TABS.find(t => t.key === activeTab)?.statuses ?? Object.keys(STATUS);
  const filtered = orders.filter(o => {
    if (!tabStatuses.includes(o.status)) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.productName.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const pageNumbers = (() => {
    const total = totalPages;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(page - 2, total - 4));
    return Array.from({ length: 5 }, (_, i) => start + i);
  })();

  const statCards: Array<{ tab: string; icon: string; label: string; value: number | string; color: string; wide?: boolean }> = [
    { tab: "new",       icon: "🆕", label: "جديد اليوم",   value: todayStats.new,       color: "text-[#4361EE]" },
    { tab: "transit",   icon: "🚚", label: "في الطريق",    value: todayStats.shipped,   color: "text-cyan-600"  },
    { tab: "delivered", icon: "✅", label: "تم التسليم",   value: todayStats.delivered, color: "text-green-600" },
    { tab: "returned",  icon: "↩️", label: "مرتجع",        value: todayStats.returned,  color: "text-red-500"   },
    { tab: "profit",    icon: "💰", label: "أرباح اليوم",  value: `${todayStats.profit.toFixed(0)} د.م`, color: "text-emerald-600", wide: true },
  ];

  return (
    <div className="space-y-4" dir="rtl">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-[#1E293B]">طلباتي</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {orders.length} طلب · {periodLabel}
          </p>
        </div>
        <Link
          href="/seller/orders/new"
          className="inline-flex items-center gap-2 bg-[#FB923C] hover:bg-orange-500 active:scale-95 text-white px-5 py-3 rounded-xl font-bold transition shadow-sm text-sm w-full sm:w-auto justify-center"
        >
          <span className="text-lg leading-none font-black">+</span>
          طلب جديد
        </Link>
      </div>

      {/* ── Today Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {statCards.map(card => (
          <button
            key={card.label}
            onClick={() => card.tab !== "profit" && setTab(card.tab)}
            className={[
              "bg-white rounded-2xl border p-3 text-right transition",
              card.tab !== "profit" ? "hover:shadow-md cursor-pointer" : "cursor-default",
              card.wide ? "col-span-2 sm:col-span-1" : "",
              activeTab === card.tab && card.tab !== "profit"
                ? "border-[#4361EE] ring-2 ring-[#4361EE]/20 shadow-sm"
                : "border-[#E2E8F0] hover:border-slate-300",
            ].join(" ")}
          >
            <div className="flex items-start justify-between mb-1">
              <span className="text-lg">{card.icon}</span>
              <span className={`text-xl font-black ${card.color}`}>{card.value}</span>
            </div>
            <p className="text-xs text-slate-400 font-bold">{card.label}</p>
          </button>
        ))}
      </div>

      {/* ── Controls: Date + Search + Tabs ── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Date picker */}
          <div className="flex-1">
            <DateDropdown
              period={period}
              from={from}
              to={to}
              onChange={(p, f, t) => router.push(`/seller/orders?period=${p}&from=${f}&to=${t}`)}
            />
          </div>
          {/* Search */}
          <div className="relative flex-1 sm:max-w-sm">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="اسم العميل أو رقم الهاتف..."
              className="w-full pr-9 pl-8 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#4361EE] bg-[#F8FAFC] focus:bg-white transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs leading-none"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
          {TABS.map(tab => {
            const count = orders.filter(o => tab.statuses.includes(o.status)).length;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition flex-shrink-0 ${
                  active
                    ? "bg-[#4361EE] text-white shadow-sm"
                    : "text-slate-500 hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                }`}
              >
                {tab.label}
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-black leading-none ${
                  active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Empty State ── */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] py-20 text-center">
          <p className="text-5xl mb-4">{search ? "🔍" : "📦"}</p>
          <p className="text-xl font-black text-[#1E293B] mb-2">
            {search ? "لا توجد نتائج" : "لا توجد طلبات"}
          </p>
          <p className="text-slate-400 text-sm mb-6">
            {search
              ? `لم نجد طلبات تطابق "${search}"`
              : "لم تضف أي طلبات في هذه الفترة بعد"}
          </p>
          {!search && (
            <Link
              href="/seller/orders/new"
              className="inline-flex items-center gap-2 bg-[#FB923C] hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-bold transition"
            >
              <span className="text-lg">+</span> أضف أول طلب
            </Link>
          )}
        </div>
      )}

      {paginated.length > 0 && (
        <>
          {/* ── Desktop Table ── */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  {["رقم الطلب", "العميل", "المنتج", "COD", "الحالة", "التاريخ", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-slate-500 font-bold text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(order => (
                  <tr key={order.id} className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#F8FAFC]/60 transition">
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-slate-500 font-bold bg-slate-50 px-2 py-1 rounded-lg">
                        {fmtRef(order.id, order.seqId)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-[#1E293B] leading-tight">{order.customerName}</p>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="text-[#4361EE] text-xs font-mono hover:underline"
                      >
                        {order.customerPhone}
                      </a>
                      <p className="text-slate-400 text-xs mt-0.5">{order.city}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[#1E293B] font-medium leading-tight">{order.productName}</p>
                      <p className="text-slate-400 text-xs">×{order.quantity}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-black text-[#1E293B] text-base">{order.codAmount.toFixed(0)}</span>
                      <span className="text-slate-400 text-xs"> د.م</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge
                        order={order}
                        openId={openDropdown}
                        updatingId={updatingId}
                        onToggle={id => setOpenDropdown(openDropdown === id ? null : id)}
                        onSelect={updateStatus}
                        dropdownSide="right"
                      />
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {fmtDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/seller/orders/${order.id}`}
                        className="text-[#4361EE] hover:bg-[#EEF2FF] px-3 py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        عرض
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="md:hidden space-y-3">
            {paginated.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                          {fmtRef(order.id, order.seqId)}
                        </span>
                        <span className="text-xs text-slate-400">{fmtDate(order.createdAt)}</span>
                      </div>
                      <p className="font-black text-[#1E293B] text-base leading-tight truncate">{order.customerName}</p>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="text-[#4361EE] font-mono text-sm hover:underline"
                      >
                        {order.customerPhone}
                      </a>
                    </div>
                    <StatusBadge
                      order={order}
                      openId={openDropdown}
                      updatingId={updatingId}
                      onToggle={id => setOpenDropdown(openDropdown === id ? null : id)}
                      onSelect={updateStatus}
                      dropdownSide="left"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
                    <div className="min-w-0">
                      <p className="text-sm text-[#1E293B] font-medium truncate">
                        {order.productName}{" "}
                        <span className="text-slate-400 font-normal">×{order.quantity}</span>
                      </p>
                      <p className="text-xs text-slate-400">{order.city}</p>
                    </div>
                    <div className="text-left flex-shrink-0 mr-3">
                      <p className="font-black text-[#1E293B]">
                        {order.codAmount.toFixed(0)}{" "}
                        <span className="text-slate-400 font-normal text-xs">د.م</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#F1F5F9] bg-[#F8FAFC] px-4 py-2.5 flex justify-end">
                  <Link
                    href={`/seller/orders/${order.id}`}
                    className="text-[#4361EE] text-sm font-bold flex items-center gap-1"
                  >
                    عرض التفاصيل
                    <span className="text-base leading-none">←</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm font-bold text-slate-500 hover:bg-[#F8FAFC] disabled:opacity-40 transition"
              >
                ← السابق
              </button>
              {pageNumbers.map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition ${
                    page === n
                      ? "bg-[#4361EE] text-white shadow-sm"
                      : "border border-[#E2E8F0] text-slate-500 hover:bg-[#F8FAFC]"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm font-bold text-slate-500 hover:bg-[#F8FAFC] disabled:opacity-40 transition"
              >
                التالي →
              </button>
            </div>
          )}
        </>
      )}

      {/* Result count */}
      {filtered.length > 0 && (
        <p className="text-center text-xs text-slate-400 pb-2">
          عرض {Math.min(page * PER_PAGE, filtered.length)} من {filtered.length} طلب
        </p>
      )}
    </div>
  );
}
