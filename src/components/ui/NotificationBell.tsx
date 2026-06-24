"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

// ─── Time-ago helper ──────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins  <  1) return "الآن";
  if (mins  < 60) return `منذ ${mins} دقيقة`;
  if (hours <  2) return "منذ ساعة";
  if (hours < 24) return `منذ ${hours} ساعات`;
  if (days  <  2) return "منذ يوم";
  return `منذ ${days} أيام`;
}

// ─── Icon per type ────────────────────────────────────────────────────────────

const TYPE_ICON: Record<string, string> = {
  DEPOSIT_APPROVED: "✅",
  DEPOSIT_REJECTED: "❌",
  PROFIT_CREDITED:  "💰",
  ORDER_STATUS:     "🚚",
  WALLET_DEDUCTED:  "📦",
  NEW_ORDER:        "🔔",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen]             = useState(false);
  const [unread, setUnread]         = useState(0);
  const [prevUnread, setPrevUnread] = useState(0);
  const [items, setItems]           = useState<Notification[]>([]);
  const [loading, setLoading]       = useState(false);
  const [pulse, setPulse]           = useState(false);
  const dropdownRef                 = useRef<HTMLDivElement>(null);

  // ── Fetch unread count ────────────────────────────────────────────────────

  const fetchCount = useCallback(async () => {
    try {
      const res = await axios.get("/api/notifications?limit=1");
      const count: number = res.data.unreadCount ?? 0;
      setUnread(count);
      if (count > prevUnread && prevUnread !== 0) {
        setPulse(true);
        setTimeout(() => setPulse(false), 2000);
      }
      setPrevUnread(count);
    } catch {}
  }, [prevUnread]);

  // ── Fetch full list ───────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/notifications?limit=10");
      setItems(res.data.notifications ?? []);
      setUnread(res.data.unreadCount ?? 0);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  // ── Polling every 30s ─────────────────────────────────────────────────────

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // ── Close on outside click (desktop only) ────────────────────────────────

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Lock body scroll when open on mobile ─────────────────────────────────

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ── Mark single read + navigate ───────────────────────────────────────────

  const handleClick = async (item: Notification) => {
    setOpen(false);
    if (!item.isRead) {
      try {
        await axios.post(`/api/notifications/read/${item.id}`);
        setUnread((u) => Math.max(0, u - 1));
        setItems((prev) => prev.map((n) => n.id === item.id ? { ...n, isRead: true } : n));
      } catch {}
    }
    if (item.link) router.push(item.link);
  };

  // ── Mark all read ─────────────────────────────────────────────────────────

  const markAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.post("/api/notifications/read-all");
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-[#EEF2FF] hover:bg-[#4361EE] text-[#4361EE] hover:text-white transition"
        aria-label="الإشعارات"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`w-5 h-5 ${pulse ? "animate-bounce" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z"
            clipRule="evenodd"
          />
        </svg>

        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Panel — full screen on mobile, dropdown on desktop */}
      {open && (
        <>
          {/* Mobile backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
          />

          <div
            dir="rtl"
            className={[
              // Mobile: full screen
              "fixed inset-0 z-50 flex flex-col bg-white overflow-hidden",
              // Desktop: dropdown
              "md:absolute md:inset-auto md:left-0 md:top-12 md:w-80 md:rounded-2xl md:shadow-2xl md:border md:border-[#E2E8F0]",
            ].join(" ")}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9] flex-shrink-0">
              <span className="font-black text-[#1E293B] text-base md:text-sm">الإشعارات</span>
              <div className="flex items-center gap-3">
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-[#4361EE] font-bold hover:underline"
                  >
                    تحديد الكل كمقروء
                  </button>
                )}
                {/* Close button — mobile only */}
                <button
                  onClick={() => setOpen(false)}
                  className="md:hidden w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 text-xl rounded-lg hover:bg-slate-100 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto md:max-h-[360px]">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[#4361EE] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-2">🔔</p>
                  <p className="text-slate-400 text-sm font-medium">لا توجد إشعارات</p>
                </div>
              ) : (
                items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleClick(item)}
                    className={`w-full text-right flex items-start gap-3 px-4 py-4 md:py-3 border-b border-[#F8FAFC] last:border-0 hover:bg-[#F8FAFC] transition min-h-[64px] md:min-h-0 ${!item.isRead ? "bg-[#EEF2FF]/40" : ""}`}
                  >
                    <div className="flex-shrink-0 mt-1.5">
                      {item.isRead
                        ? <div className="w-2 h-2 rounded-full bg-transparent" />
                        : <div className="w-2 h-2 rounded-full bg-[#4361EE]" />
                      }
                    </div>

                    <span className="text-xl flex-shrink-0">{TYPE_ICON[item.type] ?? "🔔"}</span>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${item.isRead ? "text-slate-600 font-medium" : "text-[#1E293B] font-bold"}`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>
                      <p className="text-[11px] text-slate-300 mt-1">{timeAgo(item.createdAt)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#F1F5F9] px-4 py-3 flex-shrink-0">
              <button
                onClick={() => { setOpen(false); router.push("/seller/notifications"); }}
                className="w-full text-center text-sm md:text-xs text-[#4361EE] font-bold hover:underline py-1"
              >
                عرض كل الإشعارات →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
