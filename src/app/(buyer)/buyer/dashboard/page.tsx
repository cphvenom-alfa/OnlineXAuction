import { api } from "@/trpc/server";
import Link from "next/link";
export const dynamic = "force-dynamic";

export default async function BuyerDashboardPage() {
  const [profile, bids, transactions, watchlist] = await Promise.all([
    api.profile.me(),
    api.bid.myBids(),
    api.transaction.myBuyerTransactions(),
    api.auction.myWatchlist(),
  ]);

  const activeBids     = bids.filter(b => b.auction?.status === "active");
  const winningBids    = bids.filter(b => b.isWinning && b.auction?.status === "active");
  const wonAuctions    = bids.filter(b => b.auction?.status === "ended" && b.isWinning);
  const pendingPayment = transactions.filter(t => t.paymentStatus === "pending");

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Welcome back, {profile?.name?.split(" ")[0]}!</h1>
        <p className="text-sm text-gray-400 mt-0.5">Your buyer dashboard</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Bids",      value: activeBids.length,     color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Winning Bids",     value: winningBids.length,    color: "text-green-600",  bg: "bg-green-50"  },
          { label: "Won Auctions",     value: wonAuctions.length,    color: "text-blue-600",   bg: "bg-blue-50"   },
          { label: "Pending Payment",  value: pendingPayment.length, color: "text-red-600",    bg: "bg-red-50"    },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border border-gray-100 ${s.bg} p-5`}>
            <p className="text-xs font-medium text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pending payments */}
      {pendingPayment.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-sm font-bold text-amber-800 mb-3">⚠️ Pending Payments ({pendingPayment.length})</h2>
          <div className="space-y-2">
            {pendingPayment.map(t => (
              <Link key={t.id} href={`/buyer/transactions`}
                className="flex items-center justify-between rounded-xl bg-white border border-amber-200 px-4 py-3 text-sm hover:shadow-sm">
                <span className="font-semibold text-gray-800">{(t.auction as any)?.title}</span>
                <span className="font-black text-amber-700">₹{t.amount.toFixed(0)} — Pay Now</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Active bids */}
      {activeBids.length > 0 && (
        <div>
          <h2 className="text-lg font-black text-gray-900 mb-3">Your Active Bids</h2>
          <div className="space-y-2">
            {activeBids.slice(0, 5).map(b => (
              <Link key={b.id} href={`/auctions/${b.auctionId}`}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 hover:shadow-sm transition">
                <div className={`w-2 h-2 rounded-full ${b.isWinning ? "bg-green-500" : "bg-red-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{(b.auction as any)?.title}</p>
                  <p className="text-xs text-gray-400 capitalize">{(b.auction as any)?.category?.replace(/_/g, " ")}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900">₹{b.amount.toFixed(0)}</p>
                  <p className={`text-xs font-semibold ${b.isWinning ? "text-green-600" : "text-red-500"}`}>
                    {b.isWinning ? "Winning" : "Outbid"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Watchlist preview */}
      {watchlist.length > 0 && (
        <div>
          <h2 className="text-lg font-black text-gray-900 mb-3">Watchlist</h2>
          <div className="grid grid-cols-3 gap-3">
            {watchlist.slice(0, 3).map(w => (
              <Link key={w.id} href={`/auctions/${w.auctionId}`}
                className="rounded-2xl border border-gray-100 bg-white p-4 hover:shadow-sm transition">
                <p className="font-semibold text-sm text-gray-800 truncate">{w.auction?.title}</p>
                <p className="text-xs text-purple-600 font-bold mt-1">₹{w.auction?.currentPrice?.toFixed(0)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
