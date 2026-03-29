"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gavel, Bell, Heart, User, LogOut, LayoutDashboard } from "lucide-react";
import { useSession, signOut } from "@/server/better-auth/client";
import { api } from "@/trpc/react";

export function PublicNavbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { data: session } = useSession();
  const { data: notifCount } = api.notification.unreadCount.useQuery(undefined, { enabled: !!session?.user });

  async function handleLogout() {
    await signOut();
    router.push("/sign-in");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link href="/auctions" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-sm">
            <Gavel className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>
            BidHub
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { href: "/auctions",        label: "Browse"    },
            { href: "/auctions?status=ending_soon", label: "Ending Soon" },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === l.href ? "bg-purple-50 text-purple-700" : "text-gray-500 hover:bg-gray-100"
              }`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Link href="/buyer/watchlist" className="relative rounded-xl p-2 text-gray-500 hover:bg-gray-100">
                <Heart className="w-5 h-5" />
              </Link>
              <Link href="/buyer/notifications" className="relative rounded-xl p-2 text-gray-500 hover:bg-gray-100">
                <Bell className="w-5 h-5" />
                {notifCount && notifCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
              <Link href="/buyer/dashboard" className="rounded-xl p-2 text-gray-500 hover:bg-gray-100">
                <LayoutDashboard className="w-5 h-5" />
              </Link>
              <button type="button" onClick={handleLogout}
                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100">
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Sign in
              </Link>
              <Link href="/sign-up" className="rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:from-purple-500">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
