"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { use } from "react";

export default function RelistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [endTime, setEndTime] = useState("");

  const relist = api.auction.relist.useMutation({
    onSuccess: () => router.push("/seller/dashboard"),
  });

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Relist Auction</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-sm font-semibold text-gray-700 mb-1.5">New End Date & Time</label>
          <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-purple-500 focus:bg-white focus:outline-none transition" />
        </div>
        {relist.error && <p className="text-sm text-red-500">{relist.error.message}</p>}
        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={() => router.back()} className="flex-1 rounded-xl h-12 border-gray-200">
            Cancel
          </Button>
          <Button onClick={() => relist.mutate({ id, endTime })} disabled={!endTime || relist.isPending}
            className="flex-1 rounded-xl h-12 text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 font-bold disabled:opacity-50">
            {relist.isPending ? "Relisting..." : "Relist Auction"}
          </Button>
        </div>
      </div>
    </div>
  );
}

