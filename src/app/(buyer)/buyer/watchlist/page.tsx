"use client";
import { api } from "@/trpc/react";
import { AuctionCard } from "@/components/auction-card";
import { Heart } from "lucide-react";

export default function BuyerWatchlistPage() {
  const { data: watchlist = [] } = api.auction.myWatchlist.useQuery();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">My Watchlist</h1>
        <p className="text-sm text-gray-400 mt-0.5">Auctions you're keeping an eye on</p>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Heart className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-gray-400 mb-2">Your watchlist is empty.</p>
          <a href="/auctions" className="text-purple-600 font-semibold text-sm hover:underline">
            Browse auctions →
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {watchlist.map(w => (
            <AuctionCard key={w.id} auction={{ ...(w.auction as any), isWatched: true }} />
          ))}
        </div>
      )}
    </div>
  );
}

