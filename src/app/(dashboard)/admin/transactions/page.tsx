"use client";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { BarChart3, ClipboardList, DollarSign, FileText } from "lucide-react";

type Row = {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  seller: { name: string; email: string };
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  receiptImage: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  rib: string | null;
};

function getRef(row: Row) {
  const d = new Date(row.createdAt);
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const short = row.id.slice(-6).toUpperCase();
  return row.type === "DEPOSIT" ? `DEP-${ym}-${short}` : `WD-${ym}-${short}`;
}

const STATUS_LABEL: Record<string, string> = { PENDING: "معلق", APPROVED: "مؤكد", REJECTED: "ملغي" };
const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  APPROVED: "bg-green-100 text-green-700 border-green-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminTransactionsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"ALL" | "DEPOSIT" | "WITHDRAWAL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  useEffect(() => {
    axios.get("/api/admin/transactions")
      .then(res => setRows(res.data.rows || []))
      .catch(() => toast.error("فشل تحميل المعاملات"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => rows.filter(r => {
    if (typeFilter !== "ALL" && r.type !== typeFilter) return false;
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    return true;
  }), [rows, typeFilter, statusFilter]);

  const totalPending = useMemo(() => rows.filter(r => r.status === "PENDING").reduce((s, r) => s + r.amount, 0), [rows]);
  const totalConfirmed = useMemo(() => rows.filter(r => r.status === "APPROVED").reduce((s, r) => s + r.amount, 0), [rows]);

  const exportExcel = () => {
    const data = filtered.map(r => ({
      "المرجع": getRef(r),
      "النوع": r.type === "DEPOSIT" ? "إيداع" : "سحب",
      "البائع": r.seller.name,
      "البريد": r.seller.email,
      "المبلغ (د.م)": r.amount,
      "الحالة": STATUS_LABEL[r.status],
      "التاريخ": new Date(r.createdAt).toLocaleString("ar-MA"),
      "البنك": r.bankName || "—",
      "RIB": r.rib || "—",
      "وصل الإيداع": r.receiptImage || "—",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المعاملات");
    XLSX.writeFile(wb, `transactions-${Date.now()}.xlsx`);
  };

  const filterBtnCls = (active: boolean) =>
    `px-4 py-1.5 rounded-lg text-sm font-bold transition border ${active ? "bg-[#4361EE] text-white border-[#4361EE]" : "bg-white text-slate-500 border-[#E2E8F0] hover:border-[#4361EE] hover:text-[#4361EE]"}`;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#4361EE] border-t-transparent" />
      <span className="mr-3 text-[#4361EE] font-bold">جاري التحميل...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1E293B]">المعاملات المالية</h2>
          <p className="text-slate-400 text-sm mt-0.5">كل طلبات الإيداع والسحب في مكان واحد</p>
        </div>
        <button
          onClick={exportExcel}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition"
        >
          <BarChart3 className="w-4 h-4" /> تصدير Excel
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 mb-1">إجمالي المعاملات</p>
          <p className="text-2xl font-black text-[#1E293B]">{rows.length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-amber-600 mb-1">معلق (إجمالي)</p>
          <p className="text-2xl font-black text-amber-700">{totalPending.toFixed(2)} <span className="text-base font-normal">د.م</span></p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-green-600 mb-1">مؤكد (إجمالي)</p>
          <p className="text-2xl font-black text-green-700">{totalConfirmed.toFixed(2)} <span className="text-base font-normal">د.م</span></p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-400">النوع:</span>
          {(["ALL", "DEPOSIT", "WITHDRAWAL"] as const).map(v => (
            <button key={v} className={filterBtnCls(typeFilter === v)} onClick={() => setTypeFilter(v)}>
              {v === "ALL" ? "الكل" : v === "DEPOSIT" ? "إيداع" : "سحب"}
            </button>
          ))}
        </div>
        <div className="w-px h-6 bg-[#E2E8F0] hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-400">الحالة:</span>
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(v => (
            <button key={v} className={filterBtnCls(statusFilter === v)} onClick={() => setStatusFilter(v)}>
              {v === "ALL" ? "الكل" : STATUS_LABEL[v]}
            </button>
          ))}
        </div>
        <span className="mr-auto text-xs text-slate-400 font-bold">{filtered.length} نتيجة</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] p-16 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-400 font-bold">لا توجد نتائج بالفلاتر المختارة</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["المرجع", "النوع", "البائع", "المبلغ", "الحالة", "التاريخ", "بنك / RIB", "وصل"].map(h => (
                  <th key={h} className="text-right text-xs font-black text-slate-400 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id} className={`border-b border-[#E2E8F0] last:border-0 hover:bg-[#F8FAFC] transition ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono font-black text-xs bg-[#1E293B] text-white px-2 py-1 rounded-md tracking-wider">
                      {getRef(row)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${row.type === "DEPOSIT" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}>
                      <span className="flex items-center gap-1">{row.type === "DEPOSIT" ? <><DollarSign className="w-3 h-3" /> إيداع</> : <>سحب</>}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-[#1E293B] whitespace-nowrap">{row.seller.name}</p>
                    <p className="text-xs text-slate-400">{row.seller.email}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-black text-[#1E293B]">{row.amount.toFixed(2)}</span>
                    <span className="text-xs text-slate-400 mr-1">د.م</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${STATUS_COLOR[row.status]}`}>
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(row.createdAt).toLocaleString("ar-MA")}
                  </td>
                  <td className="px-4 py-3">
                    {row.rib ? (
                      <div>
                        <p className="text-xs font-bold text-[#1E293B]">{row.bankName}</p>
                        <p className="font-mono text-xs text-slate-400 tracking-wider">{row.rib}</p>
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.receiptImage ? (
                      <a href={row.receiptImage} target="_blank" rel="noreferrer"
                        className="text-xs font-bold text-[#4361EE] hover:underline flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> عرض
                      </a>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
