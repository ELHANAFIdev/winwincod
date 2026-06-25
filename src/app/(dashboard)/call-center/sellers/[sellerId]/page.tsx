"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { CheckCircle2, Phone, FileText } from "lucide-react";
import Link from "next/link";

type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  city: string;
  productName: string;
  quantity: number;
  codAmount: number;
  createdAt: string;
};

type SellerInfo = { id: string; name: string; phone?: string };
type NoteEntry = { text: string; timestamp: string };

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "للتو";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${Math.floor(hours / 24)} يوم`;
}

export default function SellerOrdersPage() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [notes, setNotes] = useState<Record<string, NoteEntry>>({});

  useEffect(() => {
    axios
      .get(`/api/call-center/orders?sellerId=${sellerId}`)
      .then((res) => {
        const fetchedOrders: Order[] = res.data.orders ?? [];
        setOrders(fetchedOrders);
        setSeller(res.data.seller ?? null);
        const stored: Record<string, NoteEntry> = {};
        fetchedOrders.forEach((o) => {
          const saved = localStorage.getItem(`cc_note_${o.id}`);
          if (saved) {
            try { stored[o.id] = JSON.parse(saved); } catch {}
          }
        });
        setNotes(stored);
      })
      .catch(() => toast.error("فشل تحميل الطلبات"))
      .finally(() => setLoading(false));
  }, [sellerId]);

  const saveNote = (orderId: string, text: string) => {
    const note: NoteEntry = { text, timestamp: new Date().toISOString() };
    localStorage.setItem(`cc_note_${orderId}`, JSON.stringify(note));
    setNotes((prev) => ({ ...prev, [orderId]: note }));
  };

  const updateOrder = async (orderId: string, status: "CONFIRMED" | "CANCELLED") => {
    setProcessingIds((prev) => new Set(prev).add(orderId));
    try {
      await axios.post("/api/call-center/update-status", { orderId, status });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success(status === "CONFIRMED" ? "تم تأكيد الطلب" : "تم إلغاء الطلب");
    } catch {
      toast.error("حدث خطأ أثناء التحديث");
    } finally {
      setProcessingIds((prev) => {
        const s = new Set(prev);
        s.delete(orderId);
        return s;
      });
    }
  };

  const bulkUpdate = async (status: "CONFIRMED" | "CANCELLED") => {
    const label = status === "CONFIRMED" ? "تأكيد" : "إلغاء";
    if (!window.confirm(`${label} جميع الطلبات (${orders.length})?`)) return;

    setBulkProcessing(true);
    const ids = [...orders.map((o) => o.id)];
    let processed = 0;

    for (const id of ids) {
      try {
        await axios.post("/api/call-center/update-status", { orderId: id, status });
        setOrders((prev) => prev.filter((o) => o.id !== id));
        processed++;
      } catch {
        // continue with next
      }
    }

    toast.success(`تم ${label} ${processed} طلب`);
    setBulkProcessing(false);
    if (processed === ids.length) router.push("/call-center/dashboard");
  };

  const totalCOD = orders.reduce((s, o) => s + Number(o.codAmount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#4361EE] border-t-transparent" />
        <span className="text-[#4361EE] font-bold">جاري التحميل...</span>
      </div>
    );
  }

  const initials = seller?.name
    ?.split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("") ?? "؟";

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      {/* Back */}
      <Link
        href="/call-center/dashboard"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-[#4361EE] font-bold text-sm transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
        العودة للقائمة
      </Link>

      {/* Seller header */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="w-16 h-16 bg-[#4361EE] rounded-2xl flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-[#0F172A]">{seller?.name ?? "البائع"}</h1>
            <p className="text-slate-400 text-sm mt-0.5">طلبات بانتظار التأكيد</p>
          </div>
          <div className="flex gap-8 flex-shrink-0">
            <div className="text-center">
              <p className="text-3xl font-black text-[#FB923C]">{orders.length}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-bold">في الانتظار</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-green-600">{totalCOD.toFixed(0)}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-bold">COD (د.م)</p>
            </div>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] p-20 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-slate-400" />
          </div>
          <p className="font-black text-[#0F172A] text-xl">لا توجد طلبات معلقة</p>
          <Link
            href="/call-center/dashboard"
            className="inline-block mt-5 bg-[#4361EE] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#3254D4] transition"
          >
            العودة للقائمة
          </Link>
        </div>
      ) : (
        <>
          {/* Bulk action bar */}
          <div className="flex items-center justify-between bg-[#0F172A] rounded-2xl px-6 py-4 gap-4 flex-wrap">
            <div>
              <p className="text-white font-black text-sm">{orders.length} طلب بانتظار التأكيد</p>
              <p className="text-white/40 text-xs mt-0.5">إجمالي التحصيل: {totalCOD.toFixed(2)} د.م</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => bulkUpdate("CANCELLED")}
                disabled={bulkProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold text-sm hover:bg-red-500/20 transition disabled:opacity-50"
              >
                <XCircleIcon />
                إلغاء الكل
              </button>
              <button
                onClick={() => bulkUpdate("CONFIRMED")}
                disabled={bulkProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition shadow-sm disabled:opacity-50"
              >
                <CheckCircleIcon />
                تأكيد الكل
              </button>
            </div>
          </div>

          {/* Orders list */}
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                processing={processingIds.has(order.id) || bulkProcessing}
                onConfirm={() => updateOrder(order.id, "CONFIRMED")}
                onCancel={() => updateOrder(order.id, "CANCELLED")}
                note={notes[order.id] ?? null}
                onSaveNote={(text) => saveNote(order.id, text)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function OrderCard({
  order, processing, onConfirm, onCancel, note, onSaveNote,
}: {
  order: Order;
  processing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  note: NoteEntry | null;
  onSaveNote: (text: string) => void;
}) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState(note?.text ?? "");

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden transition-all ${
        processing ? "opacity-50 pointer-events-none" : "hover:shadow-md hover:border-[#4361EE]/20"
      }`}
    >
      {/* Card header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <h3 className="font-black text-[#0F172A] flex-1 text-sm">{order.customerName}</h3>
        <span className="bg-[#EEF2FF] text-[#4361EE] text-xs font-bold px-2.5 py-1 rounded-lg">
          {order.city}
        </span>
        <span className="text-slate-400 text-xs">
          {new Date(order.createdAt).toLocaleDateString("ar-MA")}
        </span>
      </div>

      {/* Card body */}
      <div className="p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          {/* Left: info */}
          <div className="flex-1 space-y-2 min-w-0">
            <p className="text-lg font-mono font-black text-[#0F172A] tracking-wider leading-none">
              {order.customerPhone}
            </p>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className="font-bold text-[#0F172A]">{order.productName}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500">×{order.quantity}</span>
              <span className="text-slate-300">·</span>
              <span className="font-black text-green-600">
                {Number(order.codAmount).toFixed(2)} د.م
              </span>
            </div>
            {note && (
              <p className="text-xs text-amber-600 font-bold">
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> آخر محاولة اتصال: {timeAgo(note.timestamp)}</span>
              </p>
            )}
          </div>

          {/* Right: actions */}
          <div className="flex flex-col gap-2 w-full md:w-auto flex-shrink-0">
            {/* Big call button */}
            <a
              href={`tel:${order.customerPhone}`}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition shadow-sm"
            >
              <Phone className="w-4 h-4" /> اتصل الآن
            </a>
            {/* Secondary actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowNoteInput(!showNoteInput)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-600 rounded-xl font-bold border border-amber-100 text-sm hover:bg-amber-100 transition"
              >
                <FileText className="w-4 h-4" /> ملاحظة
              </button>
              <button
                onClick={onCancel}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition border border-red-100 text-sm"
              >
                <XCircleIcon />
                إلغاء
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition shadow-sm text-sm"
              >
                <CheckCircleIcon />
                تأكيد
              </button>
            </div>
          </div>
        </div>

        {/* Note input */}
        {showNoteInput && (
          <div className="flex gap-2 pt-3 border-t border-[#E2E8F0]">
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && noteText.trim()) {
                  onSaveNote(noteText.trim());
                  setShowNoteInput(false);
                }
              }}
              className="flex-1 border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4361EE] bg-[#F8FAFC]"
              placeholder="اكتب ملاحظة عن محاولة الاتصال..."
              dir="rtl"
              autoFocus
            />
            <button
              onClick={() => {
                if (noteText.trim()) {
                  onSaveNote(noteText.trim());
                  setShowNoteInput(false);
                }
              }}
              className="px-4 py-2 bg-[#4361EE] hover:bg-[#3254D4] text-white rounded-xl text-sm font-bold transition"
            >
              حفظ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function XCircleIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
