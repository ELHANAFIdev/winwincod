"use client";
import { useRouter } from "next/navigation";
import DateDropdown from "@/components/ui/DateDropdown";

interface Props {
  period: string;
  from: string;
  to: string;
}

export default function SellerOrdersFilter({ period, from, to }: Props) {
  const router = useRouter();
  return (
    <DateDropdown
      period={period}
      from={from}
      to={to}
      onChange={(p, f, t) =>
        router.push(`/seller/orders?period=${p}&from=${f}&to=${t}`)
      }
    />
  );
}
