import { api } from "@/trpc/server";
import Link from "next/link";
export const dynamic = "force-dynamic";

export default async function SellerDashboardPage() {
  const [auctions, transactions, profile] = await Promise.all([
    api.auction.mySelling(),
    api.transaction.mySellerTransactions(),
    api.profile.me(),
  ]);

  const active   = auctions.filter(a => a.status === "active").length;
  const pending  = auctions.filter(a => a.status === "pending_approval").length;
  const ended    = auctions.filter(a => a.status === "ended").length;
  const revenue  = transactions.filter(t => t.paymentStatus === "paid").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Seller Dashboard</h1>
          <p className="text-sm text-gray-400">Welcome back, {profile?.name?.split(" ")[0]}</p>
        </div>
        <Link href="/seller/create"
          className="rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:from-purple-500 hover:to-violet-500 transition">
          + New Auction
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active",          value: active,              color: "text-green-600",  bg: "bg-green-50"  },
          { label: "Pending Approval",value: pending,             color: "text-amber-600",  bg: "bg-amber-50"  },
          { label: "Ended",           value: ended,               color: "text-blue-600",   bg: "bg-blue-50"   },
          { label: "Total Revenue",   value: `₹${revenue.toFixed(0)}`, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border border-gray-100 ${s.bg} p-5`}>
            <p className="text-xs font-medium text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-black text-gray-900 mb-3">My Auctions</h2>
        {auctions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
            <span className="text-4xl block mb-3">🔨</span>
            <p className="text-gray-400 mb-4">No auctions yet. Create your first one!</p>
            <Link href="/seller/create"
              className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-purple-500">
              Create Auction
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Title","Category","Status","Current Price","Bids","End Time","Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {auctions.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-semibold text-gray-800 max-w-xs">
                      <p className="truncate">{a.title}</p>
                    </td>
                    <td className="px-5 py-3 text-xs capitalize text-gray-500">{a.category.replace(/_/g, " ")}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        a.status === "active"             ? "bg-green-100 text-green-700"
                        : a.status === "pending_approval" ? "bg-amber-100 text-amber-700"
                        : a.status === "ended"            ? "bg-blue-100 text-blue-700"
                        : a.status === "cancelled"        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-500"
                      }`}>{a.status.replace(/_/g, " ")}</span>
                    </td>
                    <td className="px-5 py-3 font-bold text-purple-700">₹{a.currentPrice.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-gray-500">{a.bids?.length ?? 0}</td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {a.endTime ? new Date(a.endTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <Link href={`/auctions/${a.id}`} className="rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50">
                          View
                        </Link>
                        {a.status === "draft" && (
                          <Link href={`/seller/edit/${a.id}`} className="rounded-lg border border-purple-200 px-2.5 py-1 text-[11px] font-medium text-purple-600 hover:bg-purple-50">
                            Edit
                          </Link>
                        )}
                        {a.status === "ended" && (a.bids as any[]).length === 0 && (
                          <Link href={`/seller/relist/${a.id}`} className="rounded-lg border border-green-200 px-2.5 py-1 text-[11px] font-medium text-green-600 hover:bg-green-50">
                            Relist
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
