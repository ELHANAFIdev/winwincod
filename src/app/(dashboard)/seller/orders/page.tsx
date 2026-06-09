import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  DELIVERED: { label: "تم التسليم", cls: "bg-green-50 text-green-700 border border-green-100" },
  RETURNED:  { label: "مرتجع",      cls: "bg-red-50 text-red-600 border border-red-100" },
  SHIPPED:   { label: "في الطريق",  cls: "bg-blue-50 text-[#4361EE] border border-blue-100" },
  DRAFT:     { label: "مسودة",      cls: "bg-gray-100 text-gray-500" },
  CONFIRMED: { label: "مؤكد",       cls: "bg-[#EEF2FF] text-[#4361EE] border border-blue-100" },
  PROCESSING:{ label: "قيد التجهيز",cls: "bg-orange-50 text-[#FB923C] border border-orange-100" },
  CANCELLED: { label: "ملغي",       cls: "bg-gray-100 text-gray-500" },
};

export default async function SellerOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SELLER") redirect("/login");

  const orders = await prisma.order.findMany({
    where: { sellerId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#1E293B]">طلباتي</h2>
          <p className="text-slate-400 text-sm mt-0.5">تابع حالة طلباتك وأرباحك</p>
        </div>
        <Link href="/seller/orders/new" className="bg-[#4361EE] hover:bg-[#3254D4] text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm text-sm">
          + طلب جديد
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-slate-500 font-bold">
              <th className="p-4">المنتج</th>
              <th className="p-4">الزبون / المدينة</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">COD</th>
              <th className="p-4">الربح الصافي</th>
              <th className="p-4">رقم التتبع</th>
              <th className="p-4">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => {
              const status = STATUS_MAP[o.status] || { label: o.status, cls: "bg-gray-100 text-gray-500" };
              return (
                <tr key={o.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition">
                  <td className="p-4 font-bold text-[#1E293B]">{o.productName} <span className="text-slate-400 font-normal">×{o.quantity}</span></td>
                  <td className="p-4">
                    <p className="font-medium text-[#1E293B]">{o.customerName}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{o.city}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${status.cls}`}>{status.label}</span>
                  </td>
                  <td className="p-4 font-bold text-[#1E293B]">{Number(o.codAmount).toFixed(2)} <span className="text-slate-400 font-normal">د.م</span></td>
                  <td className="p-4 font-bold text-green-600">{Number(o.netProfit).toFixed(2)} <span className="text-slate-400 font-normal">د.م</span></td>
                  <td className="p-4 text-slate-400 font-mono text-xs">{o.trackingNumber || "—"}</td>
                  <td className="p-4 text-slate-400">{new Date(o.createdAt).toLocaleDateString("ar-MA")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <p className="text-4xl mb-3">📦</p>
            لا توجد طلبات حالياً. أضف طلبك الأول!
          </div>
        )}
      </div>
    </div>
  );
}
