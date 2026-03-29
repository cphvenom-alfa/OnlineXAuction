"use client";
import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Flag } from "lucide-react";

export default function AdminReportsPage() {
  const utils = api.useUtils();
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const { data: reports = [] } = api.admin.allReports.useQuery();

  const resolve = api.admin.resolveReport.useMutation({
    onSuccess: () => {
      void utils.admin.allReports.invalidate();
      setResolveId(null);
      setNote("");
    },
  });

  const STATUS_COLORS: Record<string, string> = {
    open:      "bg-red-100 text-red-600",
    resolved:  "bg-green-100 text-green-700",
    dismissed: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Reports & Disputes</h1>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Flag className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-gray-400">No reports filed yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[r.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">{r.targetType}</span>
                  </div>
                  <p className="font-bold text-gray-900">{r.reason}</p>
                  {r.details && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.details}</p>}
                  <p className="text-xs text-gray-400 mt-1.5">
                    by {(r.reporter as any)?.name} ({(r.reporter as any)?.email}) ·{" "}
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                  {r.adminNote && (
                    <p className="text-xs text-blue-600 mt-1 bg-blue-50 px-3 py-1.5 rounded-lg">
                      Note: {r.adminNote}
                    </p>
                  )}
                </div>
                {r.status === "open" && (
                  <button type="button" onClick={() => setResolveId(r.id)}
                    className="rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-4 py-2 shrink-0">
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolve dialog */}
      <Dialog open={!!resolveId} onOpenChange={v => { if (!v) { setResolveId(null); setNote(""); } }}>
        <DialogContent className="sm:max-w-sm rounded-3xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Resolve Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <textarea placeholder="Admin note (optional)" rows={3}
              value={note} onChange={e => setNote(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none resize-none" />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setResolveId(null)} className="flex-1 rounded-xl">
                Cancel
              </Button>
              <Button onClick={() => resolveId && resolve.mutate({ id: resolveId, status: "dismissed", note: note || undefined })}
                variant="outline" disabled={resolve.isPending}
                className="flex-1 rounded-xl border-gray-300 text-gray-600">
                Dismiss
              </Button>
              <Button onClick={() => resolveId && resolve.mutate({ id: resolveId, status: "resolved", note: note || undefined })}
                disabled={resolve.isPending}
                className="flex-1 rounded-xl bg-teal-600 hover:bg-teal-500 text-white">
                Resolve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}