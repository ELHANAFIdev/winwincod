import prisma from "@/lib/prisma";

// ─── Core create ─────────────────────────────────────────────────────────────

export async function createNotification(
  userId: string,
  type: any,
  title: string,
  message: string,
  link?: string
) {
  try {
    return await prisma.notification.create({
      data: { userId, type, title, message, link },
    });
  } catch {
    // Never let a failed notification crash the main flow
  }
}

// ─── Wallet events ────────────────────────────────────────────────────────────

export async function notifyDepositApproved(sellerId: string, amount: number) {
  return createNotification(
    sellerId,
    "DEPOSIT_APPROVED",
    "تم شحن المحفظة ✅",
    `تم إضافة ${amount.toFixed(2)} درهم لمحفظتك بنجاح`,
    "/seller/wallet"
  );
}

export async function notifyDepositRejected(sellerId: string, amount: number, reason: string) {
  return createNotification(
    sellerId,
    "DEPOSIT_REJECTED",
    "تم رفض طلب الشحن ❌",
    `تم رفض طلب شحن ${amount.toFixed(2)} درهم — السبب: ${reason}`,
    "/seller/wallet"
  );
}

export async function notifyProfitCredited(
  sellerId: string,
  orderId: string,
  amount: number
) {
  const shortId = orderId.slice(-6).toUpperCase();
  return createNotification(
    sellerId,
    "PROFIT_CREDITED",
    "تم إضافة أرباحك 💰",
    `تم إضافة ${amount.toFixed(2)} درهم لمحفظتك من الطلب ORD-${shortId}`,
    "/seller/wallet"
  );
}

export async function notifyWalletDeducted(
  sellerId: string,
  batchId: string,
  amount: number,
  orderCount: number
) {
  const shortId = batchId.slice(-6).toUpperCase();
  return createNotification(
    sellerId,
    "WALLET_DEDUCTED",
    "تم خصم الدفعة من محفظتك 📦",
    `تم خصم ${amount.toFixed(2)} درهم مقابل ${orderCount} طلب — الدفعة #${shortId}`,
    "/seller/wallet"
  );
}

// ─── Order status events ──────────────────────────────────────────────────────

const ORDER_STATUS_TITLES: Record<string, string> = {
  SHIPPED:   "طلبك في الطريق 🚚",
  DELIVERED: "تم تسليم طلبك ✅",
  RETURNED:  "تم إرجاع طلبك ↩️",
  PROCESSING: "طلبك قيد التجهيز ⚙️",
  CANCELLED: "تم إلغاء طلبك ❌",
};

export async function notifyOrderStatusChanged(
  sellerId: string,
  orderId: string,
  newStatus: string
) {
  const title = ORDER_STATUS_TITLES[newStatus];
  if (!title) return; // Don't notify for every internal status

  const shortId = orderId.slice(-6).toUpperCase();
  return createNotification(
    sellerId,
    "ORDER_STATUS",
    title,
    `تم تحديث حالة الطلب رقم ORD-${shortId}`,
    "/seller/orders/drafts"
  );
}

// ─── Read / count helpers ─────────────────────────────────────────────────────

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function getNotifications(
  userId: string,
  page = 1,
  limit = 20,
  filterRead?: boolean
) {
  const where: any = { userId };
  if (filterRead === false) where.isRead = false;
  if (filterRead === true)  where.isRead = true;

  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return { items, total, totalPages: Math.ceil(total / limit) };
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
