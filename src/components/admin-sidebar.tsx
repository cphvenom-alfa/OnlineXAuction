"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gavel, LayoutDashboard, Users, ShoppingBag, CreditCard, Flag, LogOut } from "lucide-react";
import { signOut } from "@/server/better-auth/client";
import { api } from "@/trpc/react";

const navItems = [
  { href: "/admin/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/users",        label: "Users",        icon: Users           },
  { href: "/admin/auctions",     label: "Auctions",     icon: ShoppingBag     },
  { href: "/admin/transactions", label: "Transactions", icon: CreditCard      },
  { href: "/admin/reports",      label: "Reports",      icon: Flag            },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { data: profile } = api.profile.me.useQuery();
  const { data: pending  } = api.admin.pendingAuctions.useQuery();

  return (
    <aside className="w-60 h-full bg-slate-900 flex flex-col shrink-0">
      <div className="px-4 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <Gavel className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-black text-white text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>BidHub</span>
            <p className="text-[10px] text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = pathname === item.href;
          const isAuctions = item.href === "/admin/auctions";
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-purple-600/30 text-purple-300" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}>
              <Icon style={{ width: 17, height: 17 }} />
              <span className="flex-1">{item.label}</span>
              {isAuctions && pending && pending.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                  {pending.length}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-700/50 p-3">
        {profile && (
          <div className="flex items-center gap-2.5 px-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-purple-600/30 flex items-center justify-center text-xs font-bold text-purple-300">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <p className="text-xs text-slate-300 truncate">{profile.name}</p>
          </div>
        )}
        <button type="button" onClick={() => signOut().then(() => router.push("/sign-in"))}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
          <LogOut style={{ width: 14, height: 14 }} /> Sign out
        </button>
      </div>
    </aside>
  );
}
