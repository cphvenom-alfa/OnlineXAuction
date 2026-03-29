import { auth } from "@/server/better-auth/config";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return NextResponse.json({ role: null }, { status: 401 });
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id), columns: { role: true },
    });
    return NextResponse.json({ role: dbUser?.role ?? "buyer" });
  } catch {
    return NextResponse.json({ role: "buyer" }, { status: 500 });
  }
}


