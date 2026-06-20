const OZON_BASE = "https://api.ozonexpress.ma/customers";

export async function sendToOzon(order: {
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
  codAmount: number | string;
}): Promise<string | null> {
  const ozonId = process.env.OZON_ID;
  const ozonKey = process.env.OZON_API_KEY;

  if (!ozonId || !ozonKey) {
    console.warn("[Ozon] OZON_ID or OZON_API_KEY not set — skipping");
    return null;
  }

  const url = `${OZON_BASE}/${ozonId}/${ozonKey}/add-parcel`;

  const body = new URLSearchParams({
    "parcel-receiver": order.customerName,
    "parcel-phone":    order.customerPhone,
    "parcel-city":     order.city,
    "parcel-address":  order.address,
    "parcel-price":    String(order.codAmount),
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.error(`[Ozon] HTTP ${res.status}`);
      return null;
    }

    const json = await res.json();
    // Handle common response field names from Ozon Express MA
    const tracking =
      json?.tracking_number ??
      json?.tracking ??
      json?.parcel_id ??
      json?.id ??
      json?.data?.tracking_number ??
      json?.data?.tracking ??
      null;

    return tracking != null ? String(tracking) : null;
  } catch (err: any) {
    clearTimeout(timer);
    if (err?.name !== "AbortError") console.error("[Ozon] fetch error:", err?.message);
    return null;
  }
}
