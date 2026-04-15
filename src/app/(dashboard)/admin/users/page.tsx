import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { wallet: true }
  });

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">إدارة جميع المستخدمين</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b">
            <tr>
              <th className="p-4">الاسم</th>
              <th className="p-4">الإيميل</th>
              <th className="p-4">الرتبة</th>
              <th className="p-4">رصيد المحفظة</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-bold">{u.name}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : u.role === 'CALL_CENTER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4">{u.wallet?.balance ? Number(u.wallet.balance).toFixed(2) + " د.م" : "0.00 د.م"}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {u.isActive ? "نشط" : "موقوف"}
                  </span>
                </td>
                <td className="p-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString('ar-MA')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-8 text-center text-gray-500">لا يوجد مستخدمين مسجلين.</div>
        )}
      </div>
    </div>
  );
}
