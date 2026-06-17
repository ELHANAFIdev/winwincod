"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const inputCls = "w-full border border-gray-200 focus:border-[#4361EE] p-3 rounded-xl outline-none transition bg-[#F8FAFC] focus:bg-white text-[#1E293B]";
const labelCls = "text-xs font-bold text-slate-500 block mb-1.5";

export default function SellerWalletPage() {
  const [balance, setBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [history, setHistory] = useState([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [receiptImage, setReceiptImage] = useState("");
  const [receiptPreview, setReceiptPreview] = useState("");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [loadingDeposit, setLoadingDeposit] = useState(false);
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

  useEffect(() => { fetchData(); }, []);

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReceipt(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await axios.post("/api/upload", fd);
      setReceiptImage(res.data.url);
      setReceiptPreview(URL.createObjectURL(file));
      toast.success("تم رفع الوصل بنجاح");
    } catch {
      toast.error("فشل رفع الصورة، حاول مجدداً");
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleDeposit = async (e: any) => {
    e.preventDefault();
    if (!receiptImage) { toast.error("يرجى رفع صورة وصل التحويل أولاً"); return; }
    setLoadingDeposit(true);
    try {
      await axios.post("/api/seller/wallet/deposit", { amount: Number(depositAmount), receiptImage });
      toast.success("تم إرسال طلب الشحن! بانتظار مراجعة الإدارة.");
      setDepositAmount("");
      setReceiptImage("");
      setReceiptPreview("");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ");
    } finally { setLoadingDeposit(false); }
  };

  const handleWithdraw = async (e: any) => {
    e.preventDefault();
    setLoadingWithdraw(true);
    try {
      await axios.post("/api/seller/wallet/withdraw", { amount: Number(withdrawAmount), bankName, bankAccountName, rib });
      toast.success("تم تقديم طلب السحب!");
      setWithdrawAmount("");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ");
    } finally { setLoadingWithdraw(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#1E293B]">المحفظة</h2>
        <p className="text-slate-400 text-sm mt-0.5">إدارة رصيدك وأرباحك</p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#4361EE] text-white p-6 rounded-2xl shadow-lg shadow-blue-200">
          <p className="text-blue-100 text-sm font-bold mb-1">الرصيد المتاح للسحب</p>
          <h2 className="text-3xl font-black">{Number(balance).toFixed(2)} <span className="text-xl">د.م</span></h2>
        </div>
        <div className="bg-[#FB923C] text-white p-6 rounded-2xl shadow-lg shadow-orange-200">
          <p className="text-orange-100 text-sm font-bold mb-1">أرباح قيد التوصيل</p>
          <h2 className="text-3xl font-black">{Number(pendingBalance).toFixed(2)} <span className="text-xl">د.م</span></h2>
        </div>
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm">
          <p className="text-slate-400 text-sm font-bold mb-1">سحوبات قيد المعالجة</p>
          <h2 className="text-3xl font-black text-[#1E293B]">{Number(pendingWithdrawals).toFixed(2)} <span className="text-xl text-slate-400 font-normal">د.م</span></h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Withdraw form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0]">
          <h3 className="font-bold text-[#1E293B] text-lg mb-5 flex items-center gap-2">💸 سحب الأرباح</h3>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>اسم البنك</label>
                <input required type="text" className={inputCls} value={bankName} onChange={e => setBankName(e.target.value)} placeholder="CIH Bank" />
              </div>
              <div>
                <label className={labelCls}>الاسم الكامل</label>
                <input required type="text" className={inputCls} value={bankAccountName} onChange={e => setBankAccountName(e.target.value)} placeholder="يطابق الحساب" />
              </div>
            </div>
            <div>
              <label className={labelCls}>رقم الحساب (RIB — 24 رقم)</label>
              <input required type="text" minLength={24} maxLength={24} dir="ltr" className={inputCls + " tracking-widest font-mono text-left"} value={rib} onChange={e => setRib(e.target.value)} placeholder="000000000000000000000000" />
            </div>
            <div>
              <label className={labelCls}>المبلغ المراد سحبه</label>
              <div className="relative">
                <input required type="number" step="0.01" max={balance} className="w-full border-2 border-[#4361EE]/30 focus:border-[#4361EE] p-3.5 rounded-xl outline-none font-black text-2xl text-[#4361EE] bg-[#EEF2FF]" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="0.00" />
                <span className="absolute left-4 top-4 text-[#4361EE] font-bold text-sm">د.م</span>
              </div>
            </div>
            <button disabled={loadingWithdraw || balance <= 0} className="w-full bg-[#4361EE] hover:bg-[#3254D4] text-white py-3.5 rounded-xl font-bold shadow-sm transition disabled:opacity-50">
              {loadingWithdraw ? "جاري الإرسال..." : "تأكيد السحب"}
            </button>
          </form>
        </div>

        {/* Deposit form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0] h-fit">
          <h3 className="font-bold text-[#1E293B] text-lg mb-5 flex items-center gap-2">💳 شحن المحفظة</h3>
          <form onSubmit={handleDeposit} className="space-y-4">
            <div className="bg-[#EEF2FF] p-4 rounded-xl border border-blue-100">
              <p className="text-sm text-[#4361EE] leading-relaxed font-medium">
                تواصل مع الإدارة للحصول على معلومات الحساب البنكي، ثم حوّل المبلغ وارفع وصل التحويل هنا.
              </p>
            </div>
            <div>
              <label className={labelCls}>المبلغ المحوَّل</label>
              <input required type="number" step="0.01" className={inputCls + " font-bold"} value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls}>صورة وصل التحويل <span className="text-red-500">*</span></label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#4361EE]/40 rounded-xl cursor-pointer bg-[#F8FAFC] hover:bg-[#EEF2FF] transition">
                {uploadingReceipt ? (
                  <span className="text-sm text-[#4361EE] font-bold">جاري الرفع...</span>
                ) : receiptPreview ? (
                  <img src={receiptPreview} alt="وصل" className="h-full object-contain rounded-xl p-1" />
                ) : (
                  <div className="text-center">
                    <p className="text-2xl mb-1">📎</p>
                    <p className="text-sm text-slate-400 font-medium">اضغط لرفع صورة الوصل</p>
                    <p className="text-xs text-slate-300 mt-0.5">JPG, PNG, PDF</p>
                  </div>
                )}
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleReceiptUpload} disabled={uploadingReceipt} />
              </label>
              {receiptImage && (
                <p className="text-xs text-green-600 font-bold mt-1.5">✅ تم رفع الوصل بنجاح</p>
              )}
            </div>
            <button disabled={loadingDeposit || uploadingReceipt || !receiptImage} className="w-full bg-[#1E293B] hover:bg-slate-700 text-white py-3.5 rounded-xl font-bold transition disabled:opacity-50">
              {loadingDeposit ? "جاري الإرسال..." : "تأكيد طلب الشحن"}
            </button>
          </form>
        </div>
      </div>

      {/* Transaction history */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
        <h3 className="font-bold text-[#1E293B] mb-5">سجل الحركات المالية 📖</h3>
        <div className="space-y-1">
          {history.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">لا توجد حركات مالية بعد.</p>
          ) : (
            history.map((tx: any) => (
              <div key={tx.id} className="flex justify-between items-center py-3.5 px-2 border-b border-[#E2E8F0] last:border-0 hover:bg-[#F8FAFC] rounded-xl transition">
                <div>
                  <p className="font-bold text-sm text-[#1E293B]">
                    {tx.description || (tx.type === "WITHDRAWAL" ? "طلب سحب أرباح" : tx.type === "DEPOSIT" ? "شحن رصيد" : "عملية مالية")}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{new Date(tx.createdAt).toLocaleString("ar-MA")}</p>
                </div>
                <div className={`font-black text-lg ${Number(tx.amount) > 0 ? "text-green-600" : "text-slate-500"}`}>
                  {Number(tx.amount) > 0 ? "+" : ""}{Number(tx.amount).toFixed(2)} <span className="text-sm text-slate-400 font-normal">د.م</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
