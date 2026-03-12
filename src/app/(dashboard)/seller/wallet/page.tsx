"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function SellerWalletPage() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // جلب بيانات المحفظة والسجل
    axios.get("/api/seller/wallet").then(res => {
      setBalance(res.data.balance);
      setHistory(res.data.transactions);
    });
  }, []);

  const handleDeposit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/seller/wallet/deposit", { amount: Number(amount) });
      alert("تم إرسال طلب الشحن بنجاح! بانتظار مراجعة الإدارة.");
      setAmount("");
    } catch (err) {
      alert("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* بطاقة الرصيد */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-lg">
          <p className="text-blue-100 text-sm">رصيدك الحالي</p>
          <h2 className="text-4xl font-black mt-2">{Number(balance).toFixed(2)} د.م</h2>
        </div>

        {/* نموذج طلب الشحن */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold mb-4">شحن الرصيد 💰</h3>
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500">المبلغ المراد شحنه</label>
              <input 
                type="number" 
                className="w-full border p-3 rounded-lg mt-1" 
                placeholder="0.00" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
              <input 
                type="text" 
                placeholder="رابط صورة الوصل (مثلاً من Imgur أو واتساب)" 
                className="w-full border p-3 rounded-lg mt-1"
                onChange={e => setReceipt(e.target.value)} 
                />
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <p className="text-xs text-yellow-700 font-medium">
                قم بتحويل المبلغ لحسابنا البنكي (BMCE: 0000...) ثم أرسل الطلب.
              </p>
            </div>
            <button 
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black transition"
            >
              {loading ? "جاري الإرسال..." : "تأكيد طلب الشحن"}
            </button>
          </form>
        </div>
      </div>

      {/* سجل العمليات */}
      <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="font-bold mb-6">سجل المحفظة 📖</h3>
        <div className="space-y-4">
          {history.map((tx: any) => (
            <div key={tx.id} className="flex justify-between items-center border-b pb-4">
              <div>
                <p className="font-bold text-sm">{tx.description || "عملية مالية"}</p>
                <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
              </div>
              <div className={`font-bold ${Number(tx.amount) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Number(tx.amount) > 0 ? '+' : ''}{Number(tx.amount).toFixed(2)} د.م
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}