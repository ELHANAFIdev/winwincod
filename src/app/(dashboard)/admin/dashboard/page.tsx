import prisma from "@/lib/prisma";

export default async function AdminDashboard() {
  const totalOrders = await prisma.order.count();
  const deliveredOrders = await prisma.order.count({ where: { status: 'DELIVERED' } });
  const returnedOrders = await prisma.order.count({ where: { status: 'RETURNED' } });
  const shippedOrders = await prisma.order.count({ where: { status: 'SHIPPED' } });

  const deliveryRate = deliveredOrders + returnedOrders > 0
    ? ((deliveredOrders / (deliveredOrders + returnedOrders)) * 100).toFixed(1)
    : 0;

  const finishedOrders = await prisma.order.findMany({
    where: { status: { in: ['DELIVERED', 'SHIPPED', 'PROCESSING'] } },
    include: { product: true }
  });

  const platformProfit = finishedOrders.reduce((acc, order) => {
    const sellerPrice = Number(order.product?.sellerPrice || 0);
    const costPrice = Number(order.product?.costPrice || 0);
    return acc + (sellerPrice - costPrice) * order.quantity;
  }, 0);

  const walletAgg = await prisma.wallet.aggregate({ _sum: { balance: true } });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-[#1E293B]">تحليل الأداء العام 📈</h2>
        <div className="text-sm text-slate-500 font-medium bg-white px-4 py-2 rounded-lg border border-[#E2E8F0] shadow-sm">
          {new Date().toLocaleTimeString('ar-MA')}
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#4361EE] p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
          <p className="text-blue-100 text-sm font-bold mb-1">صافي ربح المنصة (المتوقع)</p>
          <h3 className="text-3xl font-black">{platformProfit.toFixed(2)} <span className="text-lg">د.م</span></h3>
          <p className="text-xs text-blue-200 mt-4">الفرق بين سعر المورد وسعر البائع</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <p className="text-slate-400 text-sm font-bold mb-1">نسبة نجاح التوصيل</p>
          <h3 className="text-3xl font-black text-green-600">{deliveryRate}%</h3>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${deliveryRate}%` }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <p className="text-slate-400 text-sm font-bold mb-1">سيولة البائعين</p>
          <h3 className="text-3xl font-black text-[#1E293B]">
            {Number(walletAgg._sum.balance || 0).toFixed(2)} <span className="text-lg">د.م</span>
          </h3>
          <p className="text-xs text-slate-400 mt-4">مجموع الأرصدة في محافظ المستخدمين</p>
        </div>
      </div>

      {/* Order Status Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusBox title="إجمالي الطلبات" value={totalOrders} accent="#4361EE" bg="#EEF2FF" fg="#4361EE" />
        <StatusBox title="في الطريق 🚚" value={shippedOrders} accent="#F59E0B" bg="#FFFBEB" fg="#B45309" />
        <StatusBox title="تم التسليم ✅" value={deliveredOrders} accent="#10B981" bg="#ECFDF5" fg="#065F46" />
        <StatusBox title="مرتجعات ↩️" value={returnedOrders} accent="#EF4444" bg="#FEF2F2" fg="#991B1B" />
      </div>

      {/* CTA Banner */}
      <div className="bg-[#1E293B] rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h4 className="text-xl font-bold mb-2">هل تحتاج إلى شحن مخزون جديد؟</h4>
          <p className="text-slate-400 text-sm">هناك منتجات وصل مخزونها لأقل من 10 قطع. راجع الكتالوج الآن.</p>
        </div>
        <button className="bg-[#4361EE] hover:bg-[#3254D4] px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-900/30">
          مراجعة المخزون 📦
        </button>
      </div>
    </div>
  );
}

function StatusBox({ title, value, bg, fg }: { title: string; value: number; accent: string; bg: string; fg: string }) {
  return (
    <div className="p-5 rounded-xl text-center border border-black/5 shadow-sm" style={{ background: bg }}>
      <p className="text-xs font-bold mb-1" style={{ color: fg, opacity: 0.7 }}>{title}</p>
      <p className="text-2xl font-black" style={{ color: fg }}>{value}</p>
    </div>
  );
}
