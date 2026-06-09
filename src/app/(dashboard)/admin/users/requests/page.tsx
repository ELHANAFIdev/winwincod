"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function UserRequestsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("/api/admin/users/requests");
      setUsers(res.data.users);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (userId: string, action: "APPROVE" | "REJECT") => {
    if (!confirm(action === "APPROVE" ? "هل تريد تفعيل هذا الحساب؟" : "هل تريد رفض وحذف الحساب؟")) return;
    try {
      await axios.post("/api/admin/users/requests/action", { userId, action });
      fetchRequests();
    } catch { alert("حدث خطأ"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#4361EE] border-t-transparent"></div>
      <span className="mr-3 text-[#4361EE] font-bold">جاري التحميل...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#1E293B]">طلبات الانضمام</h2>
          <p className="text-slate-400 text-sm mt-0.5">مراجعة طلبات تفعيل حسابات البائعين الجدد</p>
        </div>
        <span className="bg-[#FB923C]/10 text-[#FB923C] font-bold text-sm px-4 py-2 rounded-xl border border-[#FB923C]/20">
          {users.length} طلب جديد
        </span>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] p-16 text-center">
          <p className="text-4xl mb-3">🆕</p>
          <p className="text-slate-400 font-bold">لا توجد طلبات انضمام معلقة حالياً</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-slate-500 font-bold">
                <th className="p-4">الاسم</th>
                <th className="p-4">البريد</th>
                <th className="p-4">الهاتف</th>
                <th className="p-4">تاريخ التسجيل</th>
                <th className="p-4">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition">
                  <td className="p-4 font-bold text-[#1E293B]">{u.name}</td>
                  <td className="p-4 text-slate-500">{u.email}</td>
                  <td className="p-4 font-mono text-[#4361EE] font-bold">{u.phone}</td>
                  <td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString("ar-MA")}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(u.id, "APPROVE")}
                        className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition"
                      >
                        موافقة ✅
                      </button>
                      <button
                        onClick={() => handleAction(u.id, "REJECT")}
                        className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition border border-red-100"
                      >
                        رفض ❌
                      </button>
                    </div>
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
