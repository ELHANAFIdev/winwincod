"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function SellerWalletPage() {
  const [balance, setBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [history, setHistory] = useState([]);
  
  // Deposit state
  const [depositAmount, setDepositAmount] = useState("");
  const [loadingDeposit, setLoadingDeposit] = useState(false);

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [rib, setRib] = useState("");
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);

  const fetchData = () => {
    axios.get("/api/seller/wallet").then(res => {
      setBalance(res.data.balance);
      setPendingBalance(res.data.pendingBalance);
      setPendingWithdrawals(res.data.pendingWithdrawals || 0);
      setHistory(res.data.transactions);
      if (res.data.bank) {
        setBankName(res.data.bank.bankName);
        setBankAccountName(res.data.bank.bankAccountName);
        setRib(res.data.bank.rib);
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeposit = async (e: any) => {
    e.preventDefault();
    setLoadingDeposit(true);
    try {
      await axios.post("/api/seller/wallet/deposit", { amount: Number(depositAmount) });
      toast.success("تم إرسال طلب الشحن بنجاح! بانتظار مراجعة الإدارة.");
      setDepositAmount("");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ في طلب الشحن");
    } finally {
      setLoadingDeposit(false);
    }
  };

  const handleWithdraw = async (e: any) => {
    e.preventDefault();
    setLoadingWithdraw(true);
    try {
      await axios.post("/api/seller/wallet/withdraw", { 
        amount: Number(withdrawAmount),
        bankName,
        bankAccountName,
        rib
      });
      toast.success("تم تقديم طلب سحب الأرباح بنجاح!");
      setWithdrawAmount("");
      fetchData(); // تحديث الأرصدة
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ أثناء السحب");
    } finally {
      setLoadingWithdraw(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* البطاقات المالية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-8 rounded-2xl shadow-lg border border-green-400">
          <p className="text-green-100 text-sm font-medium">الرصيد المتاح للسحب</p>
          <h2 className="text-4xl font-black mt-2">{Number(balance).toFixed(2)} د.م</h2>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-8 rounded-2xl shadow-lg border border-yellow-400">
          <p className="text-orange-100 text-sm font-medium">أرباح قيد التوصيل (معلقة)</p>
          <h2 className="text-4xl font-black mt-2">{Number(pendingBalance).toFixed(2)} د.م</h2>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-8 rounded-2xl shadow-lg border border-purple-400">
          <p className="text-purple-100 text-sm font-medium">سحوبات قيد المعالجة من الإدارة</p>
          <h2 className="text-4xl font-black mt-2">{Number(pendingWithdrawals).toFixed(2)} د.م</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* نموذج طلب السحب */}
        <div className="bg-white p-8 rounded-2xl shadow-sm relative overflow-hidden border border-gray-100">
          <h3 className="font-bold mb-6 text-xl text-gray-800 flex items-center gap-2">
            <span>💸</span> سحب الأرباح
          </h3>
          <form onSubmit={handleWithdraw} className="space-y-5 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500">اسم البنك</label>
                <input required type="text" className="w-full bg-gray-50 focus:bg-white border-2 border-transparent focus:border-green-500 p-3 rounded-xl mt-1 outline-none transition" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="مثال: CIH Bank"/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">الاسم الكامل</label>
                <input required type="text" className="w-full bg-gray-50 focus:bg-white border-2 border-transparent focus:border-green-500 p-3 rounded-xl mt-1 outline-none transition" value={bankAccountName} onChange={e => setBankAccountName(e.target.value)} placeholder="يطابق الحساب"/>
              </div>
            </div>
            <div>
               <label className="text-xs font-bold text-gray-500">رقم الحساب (RIB - 24 رقم)</label>
               <input required type="text" minLength={24} maxLength={24} className="w-full bg-gray-50 focus:bg-white border-2 border-transparent focus:border-green-500 p-3 rounded-xl mt-1 text-left tracking-widest font-mono outline-none transition" dir="ltr" value={rib} onChange={e => setRib(e.target.value)} placeholder="000000000000000000000000"/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">المبلغ المراد سحبه</label>
              <input required type="number" step="0.01" max={balance} className="w-full border-2 border-green-200 focus:border-green-500 p-4 rounded-xl mt-1 text-green-700 font-black text-2xl outline-none transition" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="0.00"/>
            </div>
            <button disabled={loadingWithdraw || balance <= 0} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition transform">
              {loadingWithdraw ? "جاري الإرسال..." : "تأكيد السحب"}
            </button>
          </form>
        </div>

        {/* نموذج شحن الرصيد */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-bold mb-6 text-xl text-gray-800 flex items-center gap-2">
            <span>💳</span> شحن المحفظة (شراء رصيد)
          </h3>
          <form onSubmit={handleDeposit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500">المبلغ المنقول</label>
              <input required type="number" step="0.01" className="w-full bg-gray-50 focus:bg-white border-2 border-transparent focus:border-blue-500 p-4 rounded-xl mt-1 font-bold outline-none transition" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="0.00"/>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-800 leading-relaxed font-medium">الرجاء تحويل المبلغ المطابق لحسابنا البنكي (BMCE: 000...). بعد ذلك قم بالتأكيد عبر هذا النموذج وسيتم مراجعة طلبك وإضافة الرصيد.</p>
            </div>
            <button disabled={loadingDeposit} className="w-full bg-gray-800 text-white py-4 rounded-xl font-bold shadow-md shadow-gray-200 hover:bg-gray-900 disabled:opacity-50 transition">
              {loadingDeposit ? "لحظة..." : "أرسلت الملبغ في البنك - تأكيد"}
            </button>
          </form>
        </div>
      </div>

       {/* سجل العمليات */}
       <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-8">
        <h3 className="font-bold mb-6 text-lg text-gray-800 px-2">سجل الحركات المالية 📖</h3>
        <div className="space-y-2">
          {history.length === 0 ? <p className="text-gray-500 text-sm p-4 text-center">لا توجد حركات مالية بعد.</p> : history.map((tx: any) => (
            <div key={tx.id} className="flex justify-between items-center border-b border-gray-50 p-4 hover:bg-gray-50 rounded-xl transition">
              <div>
                <p className="font-bold text-sm text-gray-800">{tx.description || (tx.type === 'WITHDRAWAL' ? 'طلب سحب أرباح' : tx.type === 'DEPOSIT' ? 'شحن رصيد' : 'عملية مالية')}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(tx.createdAt).toLocaleString('ar-MA')}</p>
              </div>
              <div className={`font-bold text-lg ${Number(tx.amount) > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {Number(tx.amount) > 0 ? '+' : ''}{Number(tx.amount).toFixed(2)} د.م
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}