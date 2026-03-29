import { auth } from "@/server/better-auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BuyerSidebar } from "@/components/buyer-sidebar";

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <BuyerSidebar />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
