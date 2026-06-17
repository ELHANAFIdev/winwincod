export type CartItem = {
  cartId: string;
  productId: string;
  productName: string;
  productImage: string;
  sellerPrice: number;
  marketPrice: number;
  quantity: number;
};

const CART_KEY = "winwin_cart_v2";

export const getCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
};

export const saveCart = (items: CartItem[]) =>
  localStorage.setItem(CART_KEY, JSON.stringify(items));

export const clearCart = () => localStorage.removeItem(CART_KEY);
