"use client";
import { useState } from "react";
import { api } from "@/trpc/react";
import { CheckCircle, XCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export default function AdminAuctionsPage() {
  const utils = api.useUtils();
  const [rejectId,   setRejectId]   = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const { data: pending = [] }  = api.admin.pendingAuctions.useQuery();
  const { data: auctions = [] } = api.admin.allAuctions.useQuery();

  const approve  = api.admin.approveAuction.useMutation({ onSuccess: () => void utils.admin.pendingAuctions.invalidate() });
  const reject   = api.admin.rejectAuction.useMutation({ onSuccess: () => { void utils.admin.pendingAuctions.invalidate(); setRejectId(null); setRejectNote(""); } });
  const feature  = api.admin.featureAuction.useMutation({ onSuccess: () => void utils.admin.allAuctions.invalidate() });

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Auction Moderation</h1>

      {/* Pending approvals */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-amber-700 mb-3">⏳ Pending Approval ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map(a => (
              <div key={a.id} className="bg-white rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{a.title}</p>
                  <p className="text-xs text-gray-500">by {(a.seller as any)?.name} · ₹{a.basePrice.toFixed(0)} base · {a.category.replace(/_/g, " ")}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{a.description}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button onClick={() => approve.mutate({ id: a.id })} disabled={approve.isPending}
                    className="rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold h-9 px-4">
                    <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                  </Button>
                  <Button onClick={() => setRejectId(a.id)} variant="outline"
                    className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-bold h-9 px-4">
                    <XCircle className="w-4 h-4 mr-1.5" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All auctions */}
      <div>
        <h2 className="text-lg font-black text-gray-900 mb-3">All Auctions</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Title","Seller","Status","Price","Bids","Featured","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {auctions.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800 max-w-xs">
                    <p className="truncate">{a.title}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{(a.seller as any)?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      a.status === "active" ? "bg-green-100 text-green-700"
                      : a.status === "pending_approval" ? "bg-amber-100 text-amber-700"
                      : a.status === "ended" ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-500"
                    }`}>{a.status.replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-purple-700">₹{a.currentPrice.toFixed(0)}</td>
                  <td className="px-4 py-3 text-gray-500">{a.totalBids}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => feature.mutate({ id: a.id, featured: !a.isFeatured })}
                      className={`rounded-full p-1 transition ${a.isFeatured ? "text-amber-400" : "text-gray-300 hover:text-amber-400"}`}>
                      <Star className={`w-4 h-4 ${a.isFeatured ? "fill-amber-400" : ""}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/auctions/${a.id}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-purple-600 font-semibold hover:underline">View</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject dialog */}
      <Dialog open={!!rejectId} onOpenChange={v => { if (!v) { setRejectId(null); setRejectNote(""); } }}>
        <DialogContent className="sm:max-w-sm rounded-3xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900">Reject Auction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <textarea placeholder="Reason for rejection (required)" rows={3}
              value={rejectNote} onChange={e => setRejectNote(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none resize-none" />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setRejectId(null)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={() => rejectId && reject.mutate({ id: rejectId, note: rejectNote })}
                disabled={!rejectNote || reject.isPending}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 text-white">Reject</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
