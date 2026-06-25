"use client";
import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, DollarSign, Truck, Package, Bell } from "lucide-react";

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

type FilterTab = "all" | "unread" | "read";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<string, ReactNode> = {
  DEPOSIT_APPROVED: <CheckCircle className="w-5 h-5 text-green-500" />,
  DEPOSIT_REJECTED: <XCircle className="w-5 h-5 text-red-500" />,
  PROFIT_CREDITED:  <DollarSign className="w-5 h-5 text-amber-500" />,
  ORDER_STATUS:     <Truck className="w-5 h-5 text-blue-500" />,
  WALLET_DEDUCTED:  <Package className="w-5 h-5 text-slate-500" />,
  NEW_ORDER:        <Bell className="w-5 h-5 text-[#4361EE]" />,
};

const TYPE_COLOR: Record<string, string> = {
  DEPOSIT_APPROVED: "bg-green-50 border-green-100",
  DEPOSIT_REJECTED: "bg-red-50 border-red-100",
  PROFIT_CREDITED:  "bg-amber-50 border-amber-100",
  ORDER_STATUS:     "bg-blue-50 border-blue-100",
  WALLET_DEDUCTED:  "bg-slate-50 border-slate-100",
  NEW_ORDER:        "bg-[#EEF2FF] border-[#4361EE]/10",
};

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
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

// ─── Notification row ─────────────────────────────────────────────────────────

function NotifRow({
  item,
  onRead,
}: {
  item: Notification;
  onRead: (id: string) => void;
}) {
  const router = useRouter();

  const handleClick = async () => {
    if (!item.isRead) {
      try {
        await axios.post(`/api/notifications/read/${item.id}`);
        onRead(item.id);
      } catch {}
    }
    if (item.link) router.push(item.link);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition hover:shadow-sm ${
        item.isRead
          ? "bg-white border-[#E2E8F0] hover:border-[#4361EE]/30"
          : `${TYPE_COLOR[item.type] ?? "bg-[#EEF2FF] border-[#4361EE]/20"} hover:border-[#4361EE]/40`
      }`}
    >
      {/* Unread indicator */}
      <div className="flex-shrink-0 mt-2">
        {item.isRead
          ? <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
          : <div className="w-2.5 h-2.5 rounded-full bg-[#4361EE] shadow-sm shadow-blue-300" />
        }
      </div>

      {/* Icon bubble */}
      <div className="w-11 h-11 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center flex-shrink-0 shadow-sm">
        {TYPE_ICON[item.type] ?? <Bell className="w-5 h-5 text-[#4361EE]" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className={`text-sm leading-snug ${item.isRead ? "text-slate-600 font-medium" : "text-[#1E293B] font-bold"}`}>
            {item.title}
          </p>
          <span className="text-[11px] text-slate-300 whitespace-nowrap flex-shrink-0">{timeAgo(item.createdAt)}</span>
        </div>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.message}</p>
        <p className="text-[11px] text-slate-300 mt-1">
          {new Date(item.createdAt).toLocaleDateString("ar-MA", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [tab, setTab]             = useState<FilterTab>("all");
  const [items, setItems]         = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);

  const fetchData = useCallback(async (p = 1, currentTab = tab) => {
    setLoading(true);
    try {
      const readParam =
        currentTab === "unread" ? "&read=false" :
        currentTab === "read"   ? "&read=true"  : "";

      const res = await axios.get(`/api/notifications?page=${p}&limit=20${readParam}`);
      setItems(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch {
      toast.error("فشل جلب الإشعارات");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchData(1, tab); }, [tab]);

  const handleTabChange = (t: FilterTab) => {
    setTab(t);
    setPage(1);
  };

  const handleRead = (id: string) => {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAll = async () => {
    const tid = toast.loading("جاري التحديث...");
    try {
      await axios.post("/api/notifications/read-all");
      toast.success("تم تحديد الكل كمقروء", { id: tid });
      fetchData(page, tab);
    } catch {
      toast.error("حدث خطأ", { id: tid });
    }
  };

  const TAB_LABELS: Record<FilterTab, string> = {
    all:    `الكل (${total})`,
    unread: `غير مقروءة (${unreadCount})`,
    read:   "مقروءة",
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#1E293B]">الإشعارات</h2>
          <p className="text-slate-400 text-sm mt-0.5">تتبع تحديثات طلباتك ومحفظتك</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAll}
            className="text-sm text-[#4361EE] font-bold hover:underline px-3 py-2 rounded-xl hover:bg-[#EEF2FF] transition"
          >
            تحديد الكل كمقروء ✓
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F1F5F9] p-1 rounded-xl w-fit">
        {(["all", "unread", "read"] as FilterTab[]).map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              tab === t
                ? "bg-white text-[#4361EE] shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#4361EE] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E2E8F0]">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Bell className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-400 font-bold text-lg">لا توجد إشعارات</p>
          <p className="text-slate-300 text-sm mt-1">
            {tab === "unread" ? "أنت محدّث تماماً!" : "ستظهر إشعاراتك هنا عند وصولها"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <NotifRow key={item.id} item={item} onRead={handleRead} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => { setPage((p) => p - 1); fetchData(page - 1, tab); }}
            disabled={page <= 1}
            className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm font-bold text-slate-600 hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← السابق
          </button>
          <span className="text-sm text-slate-400 font-medium px-3">{page} / {totalPages}</span>
          <button
            onClick={() => { setPage((p) => p + 1); fetchData(page + 1, tab); }}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm font-bold text-slate-600 hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            التالي →
          </button>
        </div>
      )}
    </div>
  );
}
