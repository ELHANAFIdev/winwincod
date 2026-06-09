export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function RedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;

  if (role === "ADMIN") redirect("/admin/dashboard");
  if (role === "CALL_CENTER") redirect("/call-center/dashboard");
  redirect("/seller/dashboard");
}
