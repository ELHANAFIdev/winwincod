"use client";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

export default function CartButton() {
  const { totalCount, openDrawer } = useCart();

  return (
    <button
      onClick={openDrawer}
      className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-[#EEF2FF] hover:bg-[#4361EE] text-[#4361EE] hover:text-white transition"
      aria-label="سلة المشتريات"
    >
      <ShoppingCart className="w-5 h-5" />
      {totalCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-[#FB923C] text-white text-[10px] font-black min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow leading-none">
          {totalCount > 9 ? "9+" : totalCount}
        </span>
      )}
    </button>
  );
}
