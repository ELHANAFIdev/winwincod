"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function UserRequestsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب المستخدمين غير المفعلين
  const fetchRequests = async () => {
    try {
      const res = await axios.get("/api/admin/users/requests");
      setUsers(res.data.users);
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (userId: string, action: 'APPROVE' | 'REJECT') => {
    if (!confirm(action === 'APPROVE' ? "هل تريد تفعيل هذا الحساب؟" : "هل تريد رفض وحذف الحساب؟")) return;
    
    try {
      await axios.post("/api/admin/users/requests/action", { userId, action });
      fetchRequests(); // تحديث القائمة
      alert("تم تنفيذ العملية بنجاح");
    } catch (err) {
      alert("حدث خطأ");
    }
  };

  if (loading) return <div className="p-8">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">طلبات الانضمام الجديدة 🆕</h2>

      {users.length === 0 ? (
        <div className="bg-white p-8 text-center text-gray-500 rounded-xl">لا توجد طلبات معلقة حالياً.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4">الاسم</th>
                <th className="p-4">البريد</th>
                <th className="p-4">الهاتف</th>
                <th className="p-4">تاريخ التسجيل</th>
                <th className="p-4">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-bold">{u.name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4 text-blue-600 font-mono">{u.phone}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 flex gap-2">
                    <button 
                      onClick={() => handleAction(u.id, 'APPROVE')}
                      className="bg-green-600 text-white px-4 py-1 rounded text-sm font-bold hover:bg-green-700"
                    >
                      موافقة ✅
                    </button>
                    <button 
                      onClick={() => handleAction(u.id, 'REJECT')}
                      className="bg-red-100 text-red-600 px-4 py-1 rounded text-sm font-bold hover:bg-red-200"
                    >
                      رفض ❌
                    </button>
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