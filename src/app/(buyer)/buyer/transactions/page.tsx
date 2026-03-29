"use client";
import { api } from "@/trpc/react";
import { CheckCircle, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BuyerTransactionsPage() {
  const utils = api.useUtils();
  const { data: transactions = [] } = api.transaction.myBuyerTransactions.useQuery();
  const pay = api.transaction.pay.useMutation({
    onSuccess: () => void utils.transaction.myBuyerTransactions.invalidate(),
  });

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-black text-gray-900">My Transactions</h1>
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="text-5xl mb-3">📦</span>
          <p className="text-gray-400">No transactions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{(t.auction as any)?.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Seller: {(t.seller as any)?.name}</p>
                  <p className="text-xs text-gray-400">Invoice: {t.invoiceNumber}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-black text-gray-900">₹{t.amount.toFixed(0)}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      t.paymentStatus === "paid" ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                    }`}>{t.paymentStatus}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      t.shipStatus === "delivered" ? "bg-blue-100 text-blue-700"
                      : t.shipStatus === "shipped" ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-500"
                    }`}>{t.shipStatus.replace(/_/g, " ")}</span>
                  </div>
                </div>
                {t.paymentStatus === "pending" && (
                  <Button onClick={() => pay.mutate({ transactionId: t.id })} disabled={pay.isPending}
                    className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold h-10 px-5 shrink-0">
                    Pay Now
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}