"use client";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";

export default function SellerTransactionsPage() {
  const utils = api.useUtils();
  const { data: transactions = [] } = api.transaction.mySellerTransactions.useQuery();

  const markShipped = api.transaction.markShipped.useMutation({
    onSuccess: () => void utils.transaction.mySellerTransactions.invalidate(),
  });

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Transactions</h1>
      <p className="text-sm text-gray-400 -mt-4">Manage payments and shipments for your sold items</p>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="text-5xl mb-3">💳</span>
          <p className="text-gray-400">No transactions yet. Sell something first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                {/* Auction image */}
                <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center overflow-hidden shrink-0">
                  {(t.auction as any)?.images?.[0]
                    ? <img src={(t.auction as any).images[0]} alt="item" className="w-full h-full object-cover" />
                    : <span className="text-2xl">🔨</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{(t.auction as any)?.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Buyer: <span className="font-semibold text-gray-600">{(t.buyer as any)?.name}</span>
                    {" · "}Invoice: <span className="text-gray-500">{t.invoiceNumber}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      t.paymentStatus === "paid" ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                    }`}>{t.paymentStatus}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      t.shipStatus === "delivered" ? "bg-blue-100 text-blue-700"
                      : t.shipStatus === "shipped"  ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-500"
                    }`}>{t.shipStatus.replace(/_/g, " ")}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xl font-black text-purple-700">₹{t.amount.toFixed(0)}</p>
                  {t.paymentStatus === "paid" && t.shipStatus === "not_shipped" && (
                    <Button onClick={() => markShipped.mutate({ transactionId: t.id })}
                      disabled={markShipped.isPending}
                      className="mt-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold h-8 text-xs px-4">
                      <Truck className="w-3.5 h-3.5 mr-1.5" /> Mark Shipped
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
