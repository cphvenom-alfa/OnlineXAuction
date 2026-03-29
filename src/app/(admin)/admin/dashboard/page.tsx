import { api } from "@/trpc/server";
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await api.admin.stats();
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Admin Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Users",       value: stats.totalUsers,       color: "text-blue-600",   bg: "bg-blue-50"   },
          { label: "Active Auctions",   value: stats.activeAuctions,   color: "text-green-600",  bg: "bg-green-50"  },
          { label: "Pending Approval",  value: stats.pendingApproval,  color: "text-amber-600",  bg: "bg-amber-50"  },
          { label: "Total Revenue",     value: `₹${stats.totalRevenue.toFixed(0)}`, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Total Bids",        value: stats.totalBids,        color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Total Sellers",     value: stats.totalSellers,     color: "text-teal-600",   bg: "bg-teal-50"   },
          { label: "Suspended Users",   value: stats.suspendedUsers,   color: "text-red-600",    bg: "bg-red-50"    },
          { label: "Transactions",      value: stats.totalTransactions, color: "text-orange-600", bg: "bg-orange-50" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border border-gray-100 ${s.bg} p-5`}>
            <p className="text-xs font-medium text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

