"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, ClipboardList } from "lucide-react";

interface Order {
  id: string;
  ref: string;
  productName: string;
  codAmount: number;
  status: string;
  createdAt: string;
  city: string;
  sellerName: string;
  sellerRef: string;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "مسودة", cls: "bg-gray-100 text-gray-600" },
  PENDING_CONFIRMATION: { label: "في انتظار التأكيد", cls: "bg-orange-100 text-orange-700" },
  CONFIRMED: { label: "مؤكد", cls: "bg-blue-50 text-blue-700" },
  WAITING_PAYMENT: { label: "بانتظار الدفع", cls: "bg-yellow-100 text-yellow-700" },
  PROCESSING: { label: "جاهز للشحن", cls: "bg-[#EEF2FF] text-[#4361EE]" },
  SHIPPED: { label: "في الطريق", cls: "bg-sky-100 text-sky-700" },
  DELIVERED: { label: "تم التسليم", cls: "bg-green-100 text-green-700" },
  CANCELLED: { label: "ملغي", cls: "bg-red-100 text-red-700" },
  RETURNED: { label: "مرتجع", cls: "bg-red-50 text-red-600" },
};

const PAGE_SIZE = 10;

export default function ActivityTable({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const q = search.trim().toLowerCase();

  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchesSearch =
      !q ||
      o.ref.toLowerCase().includes(q) ||
      o.productName.toLowerCase().includes(q) ||
      o.sellerName.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilter = (s: string) => {
    setStatusFilter(s);
    setPage(1);
  };

  const handleSearch = (s: string) => {
    setSearch(s);
    setPage(1);
  };

  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const base = page <= 3 ? 1 : page - 2;
    return base + i;
  }).filter((p) => p >= 1 && p <= totalPages);

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-[#0F172A] text-lg">آخر النشاطات</h3>
            <p className="text-slate-400 text-xs mt-0.5">{filtered.length} طلب</p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleFilter(e.target.value)}
            className="border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#1E293B] outline-none focus:border-[#4361EE] bg-[#F8FAFC] transition"
          >
            <option value="ALL">جميع الحالات</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="بحث برقم الطلب، المنتج، البائع أو المدينة..."
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pr-9 pl-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#4361EE] transition placeholder:text-slate-300"
          />
          {search && (
            <button
              onClick={() => handleSearch("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-slate-400 font-bold text-sm">
            {search ? "لا نتائج للبحث" : "لا توجد طلبات بهذه الحالة"}
          </p>
          {search && (
            <button
              onClick={() => handleSearch("")}
              className="mt-3 text-xs text-[#4361EE] font-bold hover:underline"
            >
              مسح البحث
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="p-4 text-right text-xs font-bold text-slate-500">رقم الطلب</th>
                  <th className="p-4 text-right text-xs font-bold text-slate-500">البائع</th>
                  <th className="p-4 text-right text-xs font-bold text-slate-500">المنتج</th>
                  <th className="p-4 text-right text-xs font-bold text-slate-500">المبلغ</th>
                  <th className="p-4 text-right text-xs font-bold text-slate-500">الحالة</th>
                  <th className="p-4 text-right text-xs font-bold text-slate-500">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {paginated.map((order) => {
                  const sc = STATUS_CONFIG[order.status] ?? {
                    label: order.status,
                    cls: "bg-gray-100 text-gray-600",
                  };
                  return (
                    <tr key={order.id} className="hover:bg-[#F8FAFC] transition">
                      <td className="p-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-[#4361EE] font-bold hover:underline font-mono text-xs"
                        >
                          {order.ref}
                        </Link>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-[#1E293B] text-xs">{order.sellerName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{order.sellerRef}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-[#1E293B] text-xs truncate max-w-[130px]">
                          {order.productName}
                        </p>
                        <p className="text-[10px] text-slate-400">{order.city}</p>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-black text-[#1E293B] text-sm">
                          {order.codAmount.toFixed(0)}
                        </span>
                        <span className="text-slate-400 text-xs mr-1">د.م</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${sc.cls}`}
                        >
                          {sc.label}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("ar-MA", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-[#E2E8F0] flex items-center justify-between gap-2 flex-wrap">
              <p className="text-xs text-slate-400">
                صفحة {page} من {totalPages} · {filtered.length} طلب
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#E2E8F0] text-slate-500 hover:bg-[#F8FAFC] disabled:opacity-40 transition"
                >
                  السابق
                </button>
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                      p === page
                        ? "bg-[#4361EE] text-white shadow-sm"
                        : "border border-[#E2E8F0] text-slate-500 hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#E2E8F0] text-slate-500 hover:bg-[#F8FAFC] disabled:opacity-40 transition"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
