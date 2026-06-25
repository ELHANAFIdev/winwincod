"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { FileText, FolderOpen, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ImportOrdersPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [fileData, setFileData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    axios.get("/api/seller/products").then(res => setProducts(res.data.products));
  }, []);

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const wb = XLSX.read(event.target.result, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      setFileData(data);
      toast.success(`تم قراءة ${data.length} صف من الملف`);
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const template = [{ name: "Ahmed Alami", phone: "0612345678", city: "Casablanca", address: "Maarif, Rue 10", quantity: 1, price: 200 }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, "winwincod_template.xlsx");
  };

  const handleImport = async () => {
    if (!selectedProduct) return toast.error("المرجو اختيار المنتج أولاً");
    if (fileData.length === 0) return toast.error("الملف فارغ");
    setLoading(true);
    const tid = toast.loading("جاري استيراد الطلبات...");
    try {
      const res = await axios.post("/api/seller/orders/import", { productId: selectedProduct, orders: fileData });
      toast.success(res.data.message, { id: tid });
      setTimeout(() => router.push("/seller/orders/drafts"), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ", { id: tid });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-[#1E293B]">استيراد الطلبات</h2>
          <p className="text-slate-400 text-sm mt-0.5">رفع ملف Excel يحتوي على بيانات الزبائن</p>
        </div>
        <button onClick={downloadTemplate} className="text-[#4361EE] text-sm font-bold hover:underline flex items-center gap-1">
          <FileText className="w-4 h-4" /> تحميل النموذج
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 space-y-5">
        {/* Product selector */}
        <div>
          <label className="block text-sm font-bold text-[#1E293B] mb-2">المنتج المشمول في الملف</label>
          <select
            className="w-full border border-gray-200 focus:border-[#4361EE] p-3 rounded-xl outline-none bg-white text-[#1E293B]"
            onChange={e => setSelectedProduct(e.target.value)}
          >
            <option value="">-- اختر المنتج --</option>
            {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} (المخزون: {p.stock})</option>)}
          </select>
        </div>

        {/* File upload */}
        <div className="relative border-2 border-dashed border-[#E2E8F0] hover:border-[#4361EE] rounded-2xl p-10 text-center bg-[#F8FAFC] hover:bg-[#EEF2FF]/50 transition cursor-pointer">
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <div className="space-y-2 pointer-events-none">
            <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-[#1E293B]">اضغط هنا لرفع ملف Excel</p>
            <p className="text-xs text-slate-400">أعمدة مطلوبة: name, phone, city, address, quantity, price</p>
          </div>
        </div>

        {/* Preview */}
        {fileData.length > 0 && (
          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
            <div className="bg-[#F8FAFC] px-4 py-3 text-sm font-bold text-[#1E293B] border-b border-[#E2E8F0] flex justify-between">
              <span>معاينة ({fileData.length} طلب)</span>
              <span className="text-xs text-slate-400 font-normal">يُعرض أول 10 صفوف</span>
            </div>
            <div className="max-h-56 overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#F8FAFC] text-slate-500 sticky top-0">
                  <tr>
                    {["الاسم","الهاتف","المدينة","الكمية","السعر"].map(h => <th key={h} className="p-2.5">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {fileData.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                      <td className="p-2.5">{row.name}</td>
                      <td className="p-2.5 font-mono">{row.phone}</td>
                      <td className="p-2.5">{row.city}</td>
                      <td className="p-2.5">{row.quantity || 1}</td>
                      <td className="p-2.5 text-green-600 font-bold">{row.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={loading || fileData.length === 0}
          className="w-full bg-[#4361EE] hover:bg-[#3254D4] text-white py-4 rounded-xl font-bold transition shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "جاري المعالجة..." : <span className="flex items-center justify-center gap-1">استيراد {fileData.length > 0 ? fileData.length : ""} طلب الآن <Rocket className="w-4 h-4" /></span>}
        </button>
      </div>
    </div>
  );
}
