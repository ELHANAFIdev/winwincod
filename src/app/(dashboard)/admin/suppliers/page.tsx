"use client";
import { useState, useEffect } from "react";
import axios from "axios";

const inputCls = "w-full border border-gray-200 focus:border-[#4361EE] p-3 rounded-xl outline-none transition bg-white text-[#1E293B]";

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
    fetchSuppliers();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#1E293B]">إدارة الموردين</h2>
        <p className="text-slate-400 text-sm mt-0.5">إضافة وإدارة موردي المنتجات</p>
      </div>

      {/* Add supplier form */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
        <h3 className="font-bold text-[#1E293B] text-sm mb-4">إضافة مورد جديد</h3>
        <form onSubmit={addSupplier} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-bold text-[#1E293B] mb-2">اسم المورد</label>
            <input className={inputCls} placeholder="مثلاً: شركة الأطلس للاستيراد" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold text-[#1E293B] mb-2">معلومات التواصل</label>
            <input className={inputCls} placeholder="رقم الهاتف أو الإيميل" value={contact} onChange={e => setContact(e.target.value)} />
          </div>
          <button className="bg-[#4361EE] hover:bg-[#3254D4] text-white px-6 py-3 rounded-xl font-bold transition shadow-sm whitespace-nowrap">
            + إضافة
          </button>
        </form>
      </div>

      {/* Suppliers table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-slate-500 text-sm font-bold">
              <th className="p-4">اسم المورد</th>
              <th className="p-4">التواصل</th>
              <th className="p-4">تاريخ الإضافة</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr><td colSpan={3} className="p-10 text-center text-slate-400">لا يوجد موردون مسجلون بعد.</td></tr>
            ) : (
              suppliers.map((s: any) => (
                <tr key={s.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition">
                  <td className="p-4 font-bold text-[#1E293B]">{s.name}</td>
                  <td className="p-4 text-slate-500 text-sm">{s.contactInfo || "—"}</td>
                  <td className="p-4 text-slate-400 text-sm">{new Date(s.createdAt).toLocaleDateString("ar-MA")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
