"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Clock, Truck, CheckCircle, RotateCcw } from "lucide-react";

type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
  productName: string;
  quantity: number;
  codAmount: number;
  codReceived?: number;
  netProfit?: number;
  shippingFee: number;
  createdAt: string;
  updatedAt: string;
  seller: { id: string; name: string; email: string };
  product?: { sellerPrice: number };
};

type Tab = "PROCESSING" | "SHIPPED" | "DELIVERED" | "RETURNED";

const TABS: { key: Tab; label: string }[] = [
  { key: "PROCESSING", label: "قيد الانتظار" },
  { key: "SHIPPED", label: "في الطريق" },
  { key: "DELIVERED", label: "تم التسليم" },
  { key: "RETURNED", label: "مرجع" },
];

const COMMISSION = 20;

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("PROCESSING");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dispatching, setDispatching] = useState(false);
  const [deliverModal, setDeliverModal] = useState<{
    order: Order;
    cod: string;
  } | null>(null);
  const [deliverSubmitting, setDeliverSubmitting] = useState(false);
  const [returnConfirm, setReturnConfirm] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders(activeTab);
    setSelectedIds([]);
  }, [activeTab]);

  const fetchOrders = async (status: Tab) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/orders?status=${status}`);
      setOrders(res.data.orders || []);
    } catch {
      toast.error("فشل تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  };

  // --- PROCESSING tab actions ---
  const toggleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  const toggleAll = () =>
    setSelectedIds(
      selectedIds.length === orders.length ? [] : orders.map((o) => o.id)
    );

  const handleDispatch = async () => {
    if (selectedIds.length === 0) return;
    setDispatching(true);
    try {
      const res = await axios.post("/api/admin/orders/dispatch", {
        orderIds: selectedIds,
      });
      toast.success(res.data.message);
      setSelectedIds([]);
      fetchOrders("PROCESSING");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "حدث خطأ");
    } finally {
      setDispatching(false);
    }
  };

  // --- SHIPPED tab actions ---
  const openDeliverModal = (order: Order) =>
    setDeliverModal({ order, cod: String(Number(order.codAmount).toFixed(2)) });

  const calcProfit = (codReceived: number, order: Order) => {
    const productCost =
      Number(order.product?.sellerPrice ?? 0) * order.quantity;
    return Math.max(0, codReceived - productCost - COMMISSION);
  };

  const handleDeliver = async () => {
    if (!deliverModal) return;
    const cod = parseFloat(deliverModal.cod);
    if (isNaN(cod) || cod <= 0) {
      toast.error("أدخل مبلغ COD صحيح");
      return;
    }
    setDeliverSubmitting(true);
    try {
      const res = await axios.post("/api/admin/orders/deliver", {
        orderId: deliverModal.order.id,
        codReceived: cod,
      });
      toast.success(res.data.message);
      setDeliverModal(null);
      fetchOrders("SHIPPED");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "حدث خطأ");
    } finally {
      setDeliverSubmitting(false);
    }
  };

  const handleReturn = async (order: Order) => {
    try {
      const res = await axios.post("/api/admin/orders/return", {
        orderId: order.id,
      });
      toast.success(res.data.message);
      setReturnConfirm(null);
      fetchOrders("SHIPPED");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "حدث خطأ");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black text-[#1E293B]">إدارة الطلبات</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          متابعة جميع طلبات البائعين ومعالجة التسليم
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${
              activeTab === tab.key
                ? "bg-[#4361EE] text-white shadow-sm"
                : "bg-white text-slate-500 border border-[#E2E8F0] hover:border-[#4361EE]/40"
            }`}
          >
            <span>{tab.label}</span>
            {activeTab === tab.key && orders.length > 0 && (
              <span className="bg-white/20 text-white text-xs font-black px-1.5 py-0.5 rounded-lg">
                {orders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* PROCESSING tab: bulk dispatch */}
      {activeTab === "PROCESSING" && selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-[#EEF2FF] border border-[#4361EE]/20 rounded-xl px-5 py-3">
          <span className="font-bold text-[#4361EE] text-sm">
            {selectedIds.length} طلب محدد
          </span>
          <button
            onClick={handleDispatch}
            disabled={dispatching}
            className="bg-[#4361EE] hover:bg-[#3254D4] text-white px-6 py-2 rounded-xl font-bold text-sm transition disabled:opacity-60"
          >
            {dispatching ? "جاري الإرسال..." : <span className="flex items-center gap-1">إرسال للتوصيل <Truck className="w-4 h-4" /></span>}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center h-48 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#4361EE] border-t-transparent" />
          <span className="text-[#4361EE] font-bold">جاري التحميل...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] p-16 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            {activeTab === "PROCESSING" ? <Clock className="w-7 h-7 text-slate-400" />
              : activeTab === "SHIPPED" ? <Truck className="w-7 h-7 text-slate-400" />
              : activeTab === "DELIVERED" ? <CheckCircle className="w-7 h-7 text-slate-400" />
              : <RotateCcw className="w-7 h-7 text-slate-400" />}
          </div>
          <p className="text-slate-400 font-bold">لا توجد طلبات في هذه الفئة</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-slate-500 font-bold">
                {activeTab === "PROCESSING" && (
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === orders.length && orders.length > 0
                      }
                      onChange={toggleAll}
                      className="w-4 h-4 accent-[#4361EE] rounded"
                    />
                  </th>
                )}
                <th className="p-4">الزبون</th>
                <th className="p-4">المدينة</th>
                <th className="p-4">المنتج</th>
                <th className="p-4">البائع</th>
                <th className="p-4">COD</th>
                {activeTab === "DELIVERED" && <th className="p-4">COD مستلم</th>}
                {activeTab === "DELIVERED" && <th className="p-4">ربح البائع</th>}
                <th className="p-4">التاريخ</th>
                {(activeTab === "PROCESSING" || activeTab === "SHIPPED") && (
                  <th className="p-4">الإجراء</th>
                )}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() =>
                    activeTab === "PROCESSING" && toggleSelect(order.id)
                  }
                  className={`border-b border-[#E2E8F0] transition ${
                    activeTab === "PROCESSING"
                      ? selectedIds.includes(order.id)
                        ? "bg-[#EEF2FF] cursor-pointer"
                        : "hover:bg-[#F8FAFC] cursor-pointer"
                      : ""
                  }`}
                >
                  {activeTab === "PROCESSING" && (
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(order.id)}
                        onChange={() => toggleSelect(order.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 accent-[#4361EE] rounded"
                      />
                    </td>
                  )}
                  <td className="p-4">
                    <p className="font-bold text-[#1E293B]">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.customerPhone}
                    </p>
                  </td>
                  <td className="p-4 text-slate-500">{order.city}</td>
                  <td className="p-4">
                    <p className="font-medium text-slate-700">
                      {order.productName}
                    </p>
                    <p className="text-xs text-slate-400">
                      الكمية: {order.quantity}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-[#1E293B]">
                      {order.seller?.name || "—"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.seller?.email}
                    </p>
                  </td>
                  <td className="p-4 font-bold text-green-600">
                    {Number(order.codAmount).toFixed(0)} د.م
                  </td>
                  {activeTab === "DELIVERED" && (
                    <td className="p-4 font-bold text-blue-600">
                      {order.codReceived != null
                        ? Number(order.codReceived).toFixed(0) + " د.م"
                        : "—"}
                    </td>
                  )}
                  {activeTab === "DELIVERED" && (
                    <td className="p-4">
                      <span className="bg-green-50 text-green-700 font-black text-xs px-2.5 py-1 rounded-lg">
                        {order.netProfit != null
                          ? Number(order.netProfit).toFixed(0) + " د.م"
                          : "—"}
                      </span>
                    </td>
                  )}
                  <td className="p-4 text-slate-400 text-xs">
                    {new Date(order.updatedAt).toLocaleDateString("ar-MA")}
                  </td>
                  {activeTab === "SHIPPED" && (
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeliverModal(order);
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          تم التسليم
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReturnConfirm(order);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          مرجع
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Deliver Modal */}
      {deliverModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div>
              <h3 className="text-xl font-black text-[#1E293B]">
                تسجيل التسليم
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                أدخل المبلغ الذي استلمه المندوب من الزبون
              </p>
            </div>

            <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 text-sm space-y-1">
              <p className="font-bold text-[#1E293B]">
                {deliverModal.order.customerName}
              </p>
              <p className="text-slate-500">{deliverModal.order.city}</p>
              <p className="text-slate-500">{deliverModal.order.productName}</p>
              <p className="font-bold text-green-600">
                COD المتوقع: {Number(deliverModal.order.codAmount).toFixed(0)} د.م
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">
                مبلغ COD المستلم (د.م)
              </label>
              <input
                type="number"
                value={deliverModal.cod}
                onChange={(e) =>
                  setDeliverModal({ ...deliverModal, cod: e.target.value })
                }
                className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-lg font-black text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE]"
                placeholder="أدخل المبلغ"
                autoFocus
              />
            </div>

            {/* Profit preview */}
            {deliverModal.cod && parseFloat(deliverModal.cod) > 0 && (
              <div className="bg-green-50 border border-green-100 rounded-xl divide-y divide-green-100 text-sm">
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-slate-500">تكلفة المنتج للبائع</span>
                  <span className="font-bold text-slate-600">
                    {(
                      Number(deliverModal.order.product?.sellerPrice ?? 0) *
                      deliverModal.order.quantity
                    ).toFixed(0)}{" "}
                    د.م
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-slate-500">عمولة WinWinCOD</span>
                  <span className="font-bold text-slate-600">
                    {COMMISSION} د.م
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-2.5 bg-green-100/50 rounded-b-xl">
                  <span className="font-bold text-green-700">ربح البائع</span>
                  <span className="font-black text-green-700 text-lg">
                    {calcProfit(
                      parseFloat(deliverModal.cod),
                      deliverModal.order
                    ).toFixed(0)}{" "}
                    د.م
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setDeliverModal(null)}
                disabled={deliverSubmitting}
                className="flex-1 py-3 rounded-xl border border-[#E2E8F0] text-slate-600 font-bold hover:bg-[#F8FAFC] transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeliver}
                disabled={deliverSubmitting}
                className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition disabled:opacity-60"
              >
                {deliverSubmitting ? "جاري التسجيل..." : "تأكيد التسليم"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Confirm Modal */}
      {returnConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <RotateCcw className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-xl font-black text-[#1E293B]">
                تأكيد المرجع
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                هل أنت متأكد من تسجيل هذا الطلب كمرجع؟
              </p>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 text-sm text-center">
              <p className="font-bold text-[#1E293B]">
                {returnConfirm.customerName}
              </p>
              <p className="text-slate-500">{returnConfirm.productName}</p>
              <p className="text-slate-500">{returnConfirm.city}</p>
            </div>
            <p className="text-xs text-slate-400 text-center">
              سيتم إعادة المخزون تلقائياً — رسوم الشحن لا تُسترد
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setReturnConfirm(null)}
                className="flex-1 py-3 rounded-xl border border-[#E2E8F0] text-slate-600 font-bold hover:bg-[#F8FAFC] transition"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleReturn(returnConfirm)}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition"
              >
                تأكيد المرجع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
