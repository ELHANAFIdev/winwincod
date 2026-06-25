"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle, XCircle, DollarSign, Package, Minus, X } from "lucide-react";
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

// ─── Icon per notification type ───────────────────────────────────────────────

function getTypeIcon(type: string) {
  switch (type) {
    case "DEPOSIT_APPROVED": return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "DEPOSIT_REJECTED": return <XCircle className="w-4 h-4 text-red-500" />;
    case "PROFIT_CREDITED":  return <DollarSign className="w-4 h-4 text-orange-500" />;
    case "ORDER_STATUS":     return <Package className="w-4 h-4 text-blue-500" />;
    case "WALLET_DEDUCTED":  return <Minus className="w-4 h-4 text-slate-400" />;
    case "NEW_ORDER":        return <Bell className="w-4 h-4 text-blue-500" />;
    default:                 return <Bell className="w-4 h-4 text-blue-500" />;
  }
}

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
    document.body.style.overflow = open ? "hidden" : "";
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
        <Bell className={`w-5 h-5 ${pulse ? "animate-bounce" : ""}`} />
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
              "fixed inset-0 z-50 flex flex-col bg-white overflow-hidden",
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
                <button
                  onClick={() => setOpen(false)}
                  className="md:hidden w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
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
                <div className="text-center py-16 flex flex-col items-center gap-2">
                  <Bell className="w-10 h-10 text-slate-200" />
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

                    <span className="flex-shrink-0 mt-0.5">{getTypeIcon(item.type)}</span>

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
