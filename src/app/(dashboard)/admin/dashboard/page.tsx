import prisma from "@/lib/prisma";

export default async function AdminDashboard() {
  // 1. جلب إحصائيات الطلبات
  const totalOrders = await prisma.order.count();
  const deliveredOrders = await prisma.order.count({ where: { status: 'DELIVERED' } });
  const returnedOrders = await prisma.order.count({ where: { status: 'RETURNED' } });
  const shippedOrders = await prisma.order.count({ where: { status: 'SHIPPED' } });

  // 2. حساب نسبة التوصيل (Delivery Rate)
  const deliveryRate = deliveredOrders + returnedOrders > 0 
    ? ((deliveredOrders / (deliveredOrders + returnedOrders)) * 100).toFixed(1) 
    : 0;

  // 3. حساب أرباح المنصة التقريبية (الفرق بين سعر البيع للبائع وسعر التكلفة)
  // سنقوم بجلب الطلبات المؤكدة والمدفوعة لحساب الأرباح
  const finishedOrders = await prisma.order.findMany({
    where: { status: { in: ['DELIVERED', 'SHIPPED', 'PROCESSING'] } },
    include: { product: true }
  });

  const platformProfit = finishedOrders.reduce((acc, order) => {
    const sellerPrice = Number(order.product?.sellerPrice || 0);
    const costPrice = Number(order.product?.costPrice || 0);
    return acc + (sellerPrice - costPrice) * order.quantity;
  }, 0);

  // 4. إجمالي الرصيد الموجود في محافظ البائعين (التزامات المنصة)
  const walletAgg = await prisma.wallet.aggregate({ _sum: { balance: true } });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-gray-800">تحليل الأداء العام 📈</h2>
        <div className="text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-lg border">
          تحديث مباشر: {new Date().toLocaleTimeString('ar-MA')}
        </div>
      </div>

      {/* بطاقات الأداء المالي */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl shadow-blue-100">
          <p className="text-blue-100 text-sm font-bold mb-1">صافي ربح المنصة (المتوقع)</p>
          <h3 className="text-3xl font-black">{platformProfit.toFixed(2)} د.م</h3>
          <p className="text-xs text-blue-200 mt-4 italic">يعتمد على الفرق بين سعر المورد وسعر البائع</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-sm font-bold mb-1">نسبة نجاح التوصيل</p>
          <h3 className="text-3xl font-black text-green-600">{deliveryRate}%</h3>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-green-500 h-full" style={{ width: `${deliveryRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-sm font-bold mb-1">إجمالي سيولة البائعين</p>
          <h3 className="text-3xl font-black text-gray-800">
            {Number(walletAgg._sum.balance || 0).toFixed(2)} د.م
          </h3>
          <p className="text-xs text-gray-400 mt-4">مجموع الأرصدة المتوفرة في محافظ المستخدمين</p>
        </div>
      </div>

      {/* إحصائيات العمليات اللوجستية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusBox title="إجمالي الطلبات" value={totalOrders} color="bg-gray-100" />
        <StatusBox title="في الطريق 🚚" value={shippedOrders} color="bg-yellow-50 text-yellow-700" />
        <StatusBox title="تم التسليم ✅" value={deliveredOrders} color="bg-green-50 text-green-700" />
        <StatusBox title="مرتجعات ↩️" value={returnedOrders} color="bg-red-50 text-red-700" />
      </div>

      {/* قسم التنبيهات الإدارية */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
            <h4 className="text-xl font-bold mb-2">هل تحتاج إلى شحن مخزون جديد؟</h4>
            <p className="text-slate-400 text-sm">هناك منتجات وصل مخزونها لأقل من 10 قطع. راجع الكتالوج الآن.</p>
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 px-8 py-3 rounded-xl font-bold transition">
            مراجعة المخزون 📦
        </button>
      </div>
    </div>
  );
}

function StatusBox({ title, value, color }: any) {
  return (
    <div className={`${color} p-4 rounded-xl text-center border border-black/5`}>
      <p className="text-xs font-bold uppercase mb-1 opacity-70">{title}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}