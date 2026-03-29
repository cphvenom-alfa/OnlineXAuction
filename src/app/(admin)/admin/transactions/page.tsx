import { api } from "@/trpc/server";
export const dynamic = "force-dynamic";

export default async function AdminTransactionsPage() {
  const transactions = await api.admin.allTransactions();

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-black text-gray-900">All Transactions</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Invoice","Auction","Buyer","Seller","Amount","Payment","Shipping","Date"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-xs text-gray-500 font-mono">{t.invoiceNumber}</td>
                <td className="px-4 py-3 max-w-[150px]">
                  <p className="truncate text-sm font-semibold text-gray-800">{(t.auction as any)?.title}</p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{(t.buyer as any)?.name}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{(t.seller as any)?.name}</td>
                <td className="px-4 py-3 font-bold text-purple-700">₹{t.amount.toFixed(0)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    t.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>{t.paymentStatus}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    t.shipStatus === "delivered" ? "bg-blue-100 text-blue-700"
                    : t.shipStatus === "shipped" ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-500"
                  }`}>{t.shipStatus.replace(/_/g, " ")}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr><td colSpan={8} className="py-10 text-center text-sm text-gray-400">No transactions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
