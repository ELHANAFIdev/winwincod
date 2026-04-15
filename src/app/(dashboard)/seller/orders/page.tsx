import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SellerOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SELLER") redirect("/login");

  const orders = await prisma.order.findMany({
    where: { sellerId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-100 text-green-700';
      case 'RETURNED': return 'bg-red-100 text-red-700';
      case 'SHIPPED': return 'bg-blue-100 text-blue-700';
      case 'DRAFT': return 'bg-gray-100 text-gray-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">طلباتي</h2>
          <p className="text-gray-500 text-sm mt-1">تابع حالة طلباتك وأرباحك فور تسليمها</p>
        </div>
        <Link href="/seller/orders/new" className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800">
          + طلب جديد
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b">
            <tr>
              <th className="p-4">المنتج</th>
              <th className="p-4">الزبون و المدينة</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">استلام نقدي (COD)</th>
              <th className="p-4">الربح الصافي</th>
              <th className="p-4">رقم التتبع</th>
              <th className="p-4">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-bold">{o.productName} (x{o.quantity})</td>
                <td className="p-4">
                  <div>{o.customerName}</div>
                  <div className="text-gray-500 text-xs">{o.city}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(o.status)}`}>
                    {o.status}
                  </span>
                </td>
                <td className="p-4">{Number(o.codAmount).toFixed(2)} د.م</td>
                <td className="p-4 text-green-600 font-bold">
                  {Number(o.netProfit).toFixed(2)} د.م
                </td>
                <td className="p-4 text-gray-500">{o.trackingNumber || '-'}</td>
                <td className="p-4 text-gray-500">{new Date(o.createdAt).toLocaleDateString('ar-MA')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            لا توجد طلبات حالياً. انطلق وأضف طلبك الأول!
          </div>
        )}
      </div>
    </div>
  );
}
