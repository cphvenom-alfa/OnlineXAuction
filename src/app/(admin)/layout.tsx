import { auth } from "@/server/better-auth/config";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id), columns: { role: true },
  });
  if (dbUser?.role !== "admin") redirect("/auctions");
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
