"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; // مكتبة الإكسل
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ImportOrdersPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [fileData, setFileData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // جلب المنتجات للقائمة
  useEffect(() => {
    axios.get("/api/seller/products").then(res => setProducts(res.data.products));
  }, []);

  // دالة قراءة الملف
  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event: any) => {
      const workbook = XLSX.read(event.target.result, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      // تحويل الإكسل إلى JSON
      const data = XLSX.utils.sheet_to_json(sheet);
      setFileData(data);
      toast.success(`تم قراءة ${data.length} صف من الملف`);
    };
    reader.readAsBinaryString(file);
  };

  // دالة تحميل نموذج فارغ
  const downloadTemplate = () => {
    const template = [
      { name: "Ahmed Alami", phone: "0612345678", city: "Casablanca", address: "Maarif, Rue 10", quantity: 1, price: 200 }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, "winwincod_template.xlsx");
  };

  // الإرسال للسيرفر
  const handleImport = async () => {
    if (!selectedProduct) return toast.error("المرجو اختيار المنتج أولاً");
    if (fileData.length === 0) return toast.error("الملف فارغ");

    setLoading(true);
    const toastId = toast.loading("جاري استيراد الطلبات...");

    try {
      const res = await axios.post("/api/seller/orders/import", {
        productId: selectedProduct,
        orders: fileData
      });
      
      toast.success(res.data.message, { id: toastId });
      setTimeout(() => router.push("/seller/orders/drafts"), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "حدث خطأ", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800">استيراد الطلبات (Excel) 📥</h2>
        <button onClick={downloadTemplate} className="text-blue-600 text-sm font-bold hover:underline">
          تحميل نموذج Excel فارغ 📄
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        
        {/* 1. اختيار المنتج */}
        <div>
          <label className="block text-sm font-bold mb-2">أي منتج يحتوي عليه هذا الملف؟</label>
          <select 
            className="w-full border p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">-- اختر المنتج --</option>
            {products.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name} (المخزون: {p.stock})</option>
            ))}
          </select>
        </div>

        {/* 2. رفع الملف */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-blue-50 transition cursor-pointer relative">
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            onChange={handleFileUpload} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-2">
            <span className="text-4xl">📂</span>
            <p className="font-bold text-gray-600">اضغط هنا لرفع ملف Excel</p>
            <p className="text-xs text-gray-400">يجب أن يحتوي على الأعمدة: name, phone, city, address, quantity, price</p>
          </div>
        </div>

        {/* 3. معاينة البيانات */}
        {fileData.length > 0 && (
          <div className="border rounded-xl overflow-hidden">
            <div className="bg-gray-100 p-3 font-bold text-sm border-b flex justify-between">
              <span>معاينة البيانات ({fileData.length} طلب)</span>
              <span className="text-xs text-gray-500">سيتم تجاهل الصفوف غير الصالحة تلقائياً</span>
            </div>
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="p-2">الاسم</th>
                    <th className="p-2">الهاتف</th>
                    <th className="p-2">المدينة</th>
                    <th className="p-2">الكمية</th>
                    <th className="p-2">السعر</th>
                  </tr>
                </thead>
                <tbody>
                  {fileData.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{row.name}</td>
                      <td className="p-2">{row.phone}</td>
                      <td className="p-2">{row.city}</td>
                      <td className="p-2">{row.quantity || 1}</td>
                      <td className="p-2">{row.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {fileData.length > 10 && <p className="p-2 text-center text-xs text-gray-400">... والمزيد</p>}
            </div>
          </div>
        )}

        {/* زر التنفيذ */}
        <button 
          onClick={handleImport}
          disabled={loading || fileData.length === 0}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 shadow-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? "جاري المعالجة..." : `استيراد ${fileData.length} طلب الآن 🚀`}
        </button>

      </div>
    </div>
  );
}