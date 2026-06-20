export type OzonCity = {
  id: string;
  name: string;
  deliveredPrice: number;
  returnedPrice: number;
};

let _cache: OzonCity[] | null = null;
let _expiresAt = 0;

const CITIES_URL = "https://api.ozonexpress.ma/cities";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function getCities(): Promise<OzonCity[]> {
  if (_cache && Date.now() < _expiresAt) return _cache;

  try {
    const res = await fetch(CITIES_URL, { cache: "no-store" });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data: any[] = await res.json();

    _cache = data
      .map((c) => ({
        id:             String(c.ID   ?? c.id   ?? ""),
        name:           String(c.NAME ?? c.name ?? ""),
        deliveredPrice: Number(c["DELIVERED-PRICE"] ?? c.deliveredPrice ?? 0),
        returnedPrice:  Number(c["RETURNED-PRICE"]  ?? c.returnedPrice  ?? 0),
      }))
      .filter((c) => c.name.length > 0);

    _expiresAt = Date.now() + TTL_MS;
    return _cache;
  } catch (err) {
    console.error("[getCities] Failed to fetch from Ozon:", err);
    return _cache ?? []; // return stale cache on error, or empty array
  }
}
