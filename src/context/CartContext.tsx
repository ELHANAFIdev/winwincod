"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getCart, saveCart, clearCart as clearStorage, CartItem } from "@/lib/cart";

type AddItemInput = Omit<CartItem, "cartId" | "quantity"> & { quantity?: number };

type CartCtx = {
  items: CartItem[];
  addItem: (product: AddItemInput) => void;
  removeItem: (cartId: string) => void;
  updateQty: (cartId: string, delta: number) => void;
  clearAll: () => void;
  totalCount: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setItems(getCart()); }, []);

  const persist = (next: CartItem[]) => { setItems(next); saveCart(next); };

  const addItem = useCallback((product: AddItemInput) => {
    const newItem: CartItem = {
      ...product,
      quantity: product.quantity ?? 1,
      cartId: `${product.productId}-${Date.now()}`,
    };
    setItems(prev => {
      const next = [...prev, newItem];
      saveCart(next);
      return next;
    });
    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((cartId: string) => {
    setItems(prev => { const next = prev.filter(i => i.cartId !== cartId); saveCart(next); return next; });
  }, []);

  const updateQty = useCallback((cartId: string, delta: number) => {
    setItems(prev => {
      const next = prev.map(i =>
        i.cartId === cartId
          ? { ...i, quantity: Math.max(1, Math.min(i.stock, i.quantity + delta)) }
          : i
      );
      saveCart(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => { clearStorage(); setItems([]); }, []);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearAll,
      totalCount: items.reduce((sum, i) => sum + i.quantity, 0),
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
