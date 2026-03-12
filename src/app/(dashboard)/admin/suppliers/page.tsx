"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  const fetchSuppliers = () => {
    axios.get("/api/admin/suppliers").then(res => setSuppliers(res.data.suppliers));
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const addSupplier = async (e: any) => {
    e.preventDefault();
    await axios.post("/api/admin/suppliers", { name, contactInfo: contact });
    setName(""); setContact("");
    fetchSuppliers(); // تحديث القائمة
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">إدارة الموردين 🏭</h2>
      
      {/* نموذج إضافة مورد جديد */}
      <form onSubmit={addSupplier} className="bg-white p-6 rounded-xl shadow-sm flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm mb-1">اسم المورد</label>
          <input className="w-full border p-2 rounded" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1">معلومات التواصل</label>
          <input className="w-full border p-2 rounded" value={contact} onChange={e => setContact(e.target.value)} />
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold">إضافة</button>
      </form>

      {/* قائمة الموردين */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 border-b">اسم المورد</th>
              <th className="p-4 border-b">التواصل</th>
              <th className="p-4 border-b">تاريخ الإضافة</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s: any) => (
              <tr key={s.id} className="border-b">
                <td className="p-4 font-bold">{s.name}</td>
                <td className="p-4">{s.contactInfo || "---"}</td>
                <td className="p-4 text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}