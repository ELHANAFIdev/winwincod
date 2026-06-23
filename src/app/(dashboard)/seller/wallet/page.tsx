"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type TxType = "DEPOSIT" | "DEDUCTION" | "PROFIT" | "REFUND" | "WITHDRAWAL";
type TxStatus = "PENDING" | "APPROVED" | "REJECTED" | "AUTO";

interface WalletItem {
  id: string;
  type: TxType;
  amount: number;
  status: TxStatus;
  note: string | null;
  receiptUrl: string | null;
  orderId: string | null;
  createdAt: string;
}

interface Stats {
  totalDeposits: number;
  totalDeductions: number;
  totalProfits: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<TxType, string> = {
  DEPOSIT: "شحن رصيد",
  DEDUCTION: "خصم طلب",
  PROFIT: "ربح توصيل",
  REFUND: "استرداد",
  WITHDRAWAL: "سحب أرباح",
};

const STATUS_BADGE: Record<TxStatus, { label: string; cls: string }> = {
  PENDING:  { label: "في الانتظار", cls: "bg-amber-100 text-amber-700 border border-amber-200" },
  APPROVED: { label: "تم الشحن",    cls: "bg-green-100 text-green-700 border border-green-200" },
  REJECTED: { label: "مرفوض",       cls: "bg-red-100 text-red-600 border border-red-200" },
  AUTO:     { label: "مكتمل",       cls: "bg-slate-100 text-slate-600 border border-slate-200" },
};

function fmt(n: number) {
  return n.toLocaleString("ar-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("ar-MA", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ─── Deposit Modal ────────────────────────────────────────────────────────────

function DepositModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [amount, setAmount] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await axios.post("/api/upload", fd);
      setReceiptUrl(res.data.url);
      setPreview(URL.createObjectURL(file));
      toast.success("تم رفع الوصل");
    } catch {
      toast.error("فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptUrl) { toast.error("يرجى رفع وصل الدفع أولاً"); return; }
    if (!amount || Number(amount) <= 0) { toast.error("أدخل مبلغاً صحيحاً"); return; }
    setSubmitting(true);
    try {
      await axios.post("/api/seller/wallet/deposit", {
        amount: Number(amount),
        receiptImage: receiptUrl,
      });
      toast.success("تم إرسال طلب الشحن! بانتظار مراجعة الإدارة.");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-lg font-black text-[#1E293B]">شحن المحفظة</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none transition">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Info banner */}
          <div className="bg-[#EEF2FF] rounded-xl p-3.5 border border-blue-100">
            <p className="text-sm text-[#4361EE] font-medium leading-relaxed">
              تواصل مع الإدارة للحصول على معلومات الحساب البنكي، ثم حوّل المبلغ وارفع وصل التحويل هنا.
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">المبلغ (درهم) <span className="text-red-500">*</span></label>
            <input
              required
              type="number"
              step="0.01"
              min="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-200 focus:border-[#4361EE] p-3 rounded-xl outline-none bg-[#F8FAFC] focus:bg-white text-[#1E293B] font-bold text-xl"
            />
          </div>

          {/* Receipt upload */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">رفع وصل الدفع <span className="text-red-500">*</span></label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#4361EE]/40 rounded-xl cursor-pointer bg-[#F8FAFC] hover:bg-[#EEF2FF] transition overflow-hidden">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#4361EE] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-[#4361EE] font-bold">جاري الرفع...</span>
                </div>
              ) : preview ? (
                <img src={preview} alt="وصل" className="h-full w-full object-contain p-1" />
              ) : (
                <div className="text-center">
                  <p className="text-3xl mb-1">📎</p>
                  <p className="text-sm text-slate-400 font-medium">اضغط لرفع صورة الوصل</p>
                  <p className="text-xs text-slate-300 mt-0.5">JPG, PNG, PDF</p>
                </div>
              )}
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} disabled={uploading} />
            </label>
            {receiptUrl && <p className="text-xs text-green-600 font-bold mt-1.5">✅ تم رفع الوصل بنجاح</p>}
          </div>

          {/* Note */}
          <p className="text-xs text-slate-400 text-center">سيتم تأكيد الشحن خلال 24 ساعة من مراجعة الإدارة</p>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting || uploading || !receiptUrl}
              className="flex-1 bg-[#FB923C] hover:bg-orange-500 text-white py-3 rounded-xl font-bold shadow-sm transition disabled:opacity-50"
            >
              {submitting ? "جاري الإرسال..." : "إرسال طلب الشحن"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Stats card ───────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
      <div>
        <p className="text-xs font-bold text-slate-400">{label}</p>
        <p className="text-xl font-black text-[#1E293B] mt-0.5">{fmt(value)} <span className="text-sm font-normal text-slate-400">د.م</span></p>
      </div>
    </div>
  );
}

// ─── Transaction row ──────────────────────────────────────────────────────────

function TxRow({ item }: { item: WalletItem }) {
  const isCredit = item.type === "DEPOSIT" || item.type === "PROFIT" || item.type === "REFUND";
  const isDebit  = item.type === "DEDUCTION" || item.type === "WITHDRAWAL";

  const badge = item.type === "DEPOSIT"
    ? STATUS_BADGE[item.status]
    : STATUS_BADGE.AUTO;

  return (
    <tr className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] transition group">
      {/* Type */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <span className="text-base">
            {item.type === "DEPOSIT" ? "💳" : item.type === "DEDUCTION" ? "📦" : item.type === "PROFIT" ? "💰" : item.type === "REFUND" ? "↩️" : "💸"}
          </span>
          <span className="font-bold text-sm text-[#1E293B]">{TYPE_LABELS[item.type]}</span>
        </div>
        {item.orderId && (
          <p className="text-xs text-slate-400 mt-0.5 mr-6">#{item.orderId.slice(-8)}</p>
        )}
      </td>

      {/* Amount */}
      <td className="py-3.5 px-4 text-left" dir="ltr">
        <span className={`font-black text-base ${isCredit ? "text-green-600" : isDebit ? "text-red-500" : "text-slate-600"}`}>
          {isCredit ? "+" : isDebit ? "-" : ""}{fmt(Math.abs(item.amount))}
        </span>
        <span className="text-xs text-slate-400 font-normal mr-1">د.م</span>
      </td>

      {/* Status */}
      <td className="py-3.5 px-4">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge.cls}`}>
          {badge.label}
        </span>
      </td>

      {/* Date */}
      <td className="py-3.5 px-4">
        <span className="text-xs text-slate-400">{fmtDate(item.createdAt)}</span>
      </td>

      {/* Note */}
      <td className="py-3.5 px-4 max-w-[200px]">
        {item.status === "REJECTED" && item.note ? (
          <span className="text-xs text-red-500 font-medium">{item.note}</span>
        ) : item.note ? (
          <span className="text-xs text-slate-400 truncate block">{item.note}</span>
        ) : null}
        {item.receiptUrl && item.type === "DEPOSIT" && (
          <a href={item.receiptUrl} target="_blank" rel="noreferrer" className="text-xs text-[#4361EE] font-bold hover:underline block mt-0.5">
            عرض الوصل ↗
          </a>
        )}
      </td>
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SellerWalletPage() {
  const [balance, setBalance]       = useState(0);
  const [items, setItems]           = useState<WalletItem[]>([]);
  const [stats, setStats]           = useState<Stats>({ totalDeposits: 0, totalDeductions: 0, totalProfits: 0 });
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);

  const fetchBalance = useCallback(async () => {
    const res = await axios.get("/api/seller/wallet/balance");
    setBalance(res.data.balance);
  }, []);

  const fetchHistory = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/seller/wallet/history?page=${p}&limit=20`);
      setItems(res.data.items);
      setStats(res.data.stats);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch {
      toast.error("فشل جلب السجل");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchHistory(1);
  }, [fetchBalance, fetchHistory]);

  const handleDepositSuccess = () => {
    fetchBalance();
    fetchHistory(1);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page title */}
      <div>
        <h2 className="text-2xl font-black text-[#1E293B]">المحفظة</h2>
        <p className="text-slate-400 text-sm mt-0.5">إدارة رصيدك وتتبع حركاتك المالية</p>
      </div>

      {/* ── Balance card ── */}
      <div className="bg-gradient-to-br from-[#4361EE] to-[#3A56D4] rounded-2xl p-7 shadow-lg shadow-blue-200 flex items-center justify-between">
        <div>
          <p className="text-blue-100 text-sm font-bold mb-1">رصيدك الحالي</p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black text-white">{fmt(balance)}</span>
            <span className="text-xl text-blue-200 font-bold mb-1">درهم</span>
          </div>
          <p className="text-blue-200 text-xs mt-2 font-medium">يمكنك شحن محفظتك في أي وقت عبر التحويل البنكي</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#FB923C] hover:bg-orange-500 text-white px-6 py-3.5 rounded-xl font-black text-base shadow-lg transition whitespace-nowrap flex items-center gap-2"
        >
          <span className="text-xl">+</span> شحن المحفظة
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon="✅" label="إجمالي الشحنات المعتمدة" value={stats.totalDeposits}    color="bg-green-50" />
        <StatCard icon="📦" label="إجمالي الخصومات"         value={stats.totalDeductions}  color="bg-red-50" />
        <StatCard icon="💰" label="إجمالي الأرباح"           value={stats.totalProfits}     color="bg-amber-50" />
      </div>

      {/* ── Transaction history ── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
          <h3 className="font-black text-[#1E293B] text-base">سجل الحركات المالية</h3>
          {total > 0 && (
            <span className="text-xs text-slate-400">{total} حركة</span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#4361EE] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-400 font-medium">لا توجد حركات مالية بعد</p>
            <p className="text-slate-300 text-sm mt-1">ابدأ بشحن محفظتك لتتمكن من تسجيل الطلبات</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" dir="rtl">
                <thead>
                  <tr className="bg-[#F8FAFC] text-xs font-bold text-slate-400 uppercase border-b border-[#F1F5F9]">
                    <th className="py-3 px-4 text-right">النوع</th>
                    <th className="py-3 px-4 text-left">المبلغ</th>
                    <th className="py-3 px-4 text-right">الحالة</th>
                    <th className="py-3 px-4 text-right">التاريخ</th>
                    <th className="py-3 px-4 text-right">ملاحظة</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => <TxRow key={item.id} item={item} />)}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-4 border-t border-[#F1F5F9]">
                <button
                  onClick={() => fetchHistory(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-bold text-slate-600 hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ← السابق
                </button>
                <span className="text-sm text-slate-500 font-medium px-3">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => fetchHistory(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-bold text-slate-600 hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  التالي →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Deposit modal */}
      {showModal && (
        <DepositModal onClose={() => setShowModal(false)} onSuccess={handleDepositSuccess} />
      )}
    </div>
  );
}
