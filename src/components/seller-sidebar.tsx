"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gavel, LayoutDashboard, Plus, CreditCard, User, LogOut, ArrowLeft } from "lucide-react";
import { signOut } from "@/server/better-auth/client";
import { api } from "@/trpc/react";

const navItems = [
  { href: "/seller/dashboard",    label: "Dashboard",     icon: LayoutDashboard },
  { href: "/seller/create",       label: "New Auction",   icon: Plus           },
  { href: "/seller/transactions", label: "Transactions",  icon: CreditCard     },
  { href: "/seller/profile",      label: "Profile",       icon: User           },
];

export function SellerSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { data: profile } = api.profile.me.useQuery();

  return (
    <aside className="w-60 h-full bg-white border-r border-gray-100 flex flex-col shrink-0 shadow-sm">
      <div className="px-4 py-4 border-b border-gray-100">
        <Link href="/auctions" className="flex items-center gap-2 mb-2">
          <ArrowLeft className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400 font-medium">Back to auctions</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center">
            <Gavel className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-black text-gray-900 text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>BidHub</span>
            <p className="text-[10px] text-gray-400">Seller Portal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-purple-50 text-purple-700 font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}>
              <Icon className={active ? "text-purple-600" : "text-gray-400"} style={{ width: 18, height: 18 }} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-100 p-3">
        {profile && (
          <div className="flex items-center gap-2.5 px-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700 overflow-hidden shrink-0">
              {profile.image ? <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" /> : profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">{profile.name}</p>
              <p className="text-[10px] text-amber-500">★ {profile.rating.toFixed(1)}</p>
            </div>
          </div>
        )}
        <button type="button" onClick={() => signOut().then(() => router.push("/sign-in"))}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition">
          <LogOut style={{ width: 15, height: 15 }} /> Sign out
        </button>
      </div>
    </aside>
  );
}
