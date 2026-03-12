import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, errorResponse } from "@/lib/api-utils";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER") return errorResponse("غير مصرح", 401);

    // 1. جلب إحصائيات عامة
    const totalOrders = await prisma.order.count({ where: { sellerId: user.id } });
    
    // 2. توزيع الحالات (Pie Chart Data)
    const statusGroups = await prisma.order.groupBy({
      by: ['status'],
      where: { sellerId: user.id },
      _count: { id: true }
    });

    const pieData = statusGroups.map(g => ({
      name: g.status,
      value: g._count.id
    }));

    // 3. مبيعات آخر 7 أيام (Bar Chart Data)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await prisma.order.findMany({
      where: {
        sellerId: user.id,
        createdAt: { gte: sevenDaysAgo }
      },
      select: { createdAt: true, codAmount: true }
    });

    // تجميع البيانات حسب اليوم
    const salesByDay: any = {};
    recentOrders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
      salesByDay[date] = (salesByDay[date] || 0) + 1; // عدد الطلبات
    });

    // تنسيق المصفوفة للرسم البياني
    const barData = Object.keys(salesByDay).map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue...
      orders: salesByDay[date]
    })).slice(-7); // ضمان آخر 7 أيام

    return NextResponse.json({ 
      success: true, 
      totalOrders,
      pieData,
      barData
    });

  } catch (error) {
    return errorResponse("فشل جلب الإحصائيات", 500);
  }
}