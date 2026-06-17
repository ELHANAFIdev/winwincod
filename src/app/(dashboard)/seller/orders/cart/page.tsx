import { redirect } from "next/navigation";

export default function CartPage() {
  redirect("/seller/orders/checkout");
}
