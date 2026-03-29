// ============================================================
// src/components/auction-card.tsx  — FIXED
// null-safe .toFixed() on rating + seller fields
// ============================================================
"use client";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/trpc/react";
import { Heart, Users } from "lucide-react";
import { CountdownTimer } from "./countdown-timer";

type Auction = {
  id: string; title: string; images: string[]; category: string;
  currentPrice: number; totalBids: number; endTime: Date | null;
  status: string; isFeatured: boolean; isWatched?: boolean;
  seller?: { id: string; name: string; image: string | null; rating?: number | null } | null;
};

export function AuctionCard({ auction, featured }: { auction: Auction; featured?: boolean }) {
  const [watched, setWatched] = useState(auction.isWatched ?? false);

  const toggle = api.auction.toggleWatchlist.useMutation({
    onSuccess: (data) => setWatched(data.watching),
  });

  const coverImage = auction.images?.[0];
  const isEnding   = auction.endTime
    && new Date(auction.endTime).getTime() - Date.now() < 3600000
    && new Date(auction.endTime).getTime() > Date.now();

  // ── null-safe seller fields ───────────────────────────────
  const sellerName   = auction.seller?.name   ?? "Unknown seller";
  const sellerImage  = auction.seller?.image  ?? null;
  const sellerRating = auction.seller?.rating ?? 0;          // ← was crashing

  return (
    <div className={`group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 ${featured ? "ring-2 ring-purple-200" : ""}`}>
      {featured && (
        <div className="absolute top-3 left-3 z-10 rounded-full bg-purple-600 px-2.5 py-1 text-[10px] font-bold text-white">
          ⭐ Featured
        </div>
      )}
      {isEnding && auction.status === "active" && (
        <div className="absolute top-3 right-12 z-10 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white">
          🔥 Ending Soon
        </div>
      )}

      {/* Watchlist button */}
      <button
        type="button"
        onClick={() => toggle.mutate({ auctionId: auction.id })}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white transition"
      >
        <Heart className={`w-4 h-4 ${watched ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
      </button>

      {/* Image */}
      <Link href={`/auctions/${auction.id}`}>
        <div className="relative h-44 bg-gradient-to-br from-purple-50 to-violet-50 flex items-center justify-center overflow-hidden">
          {coverImage
            ? <img src={coverImage} alt={auction.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
            : <div className="text-5xl">🔨</div>}
          <span className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold capitalize text-white backdrop-blur">
            {(auction.category ?? "other").replace(/_/g, " ")}
          </span>
          {auction.status === "ended" && (
            <span className="absolute bottom-2 right-2 rounded-full bg-gray-700 px-2.5 py-1 text-[10px] font-bold text-white">
              ENDED
            </span>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-purple-700 transition mb-2">
            {auction.title}
          </h3>

          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] text-gray-400">
                {auction.status === "ended" ? "Final Bid" : "Current Bid"}
              </p>
              <p className="text-lg font-black text-purple-700">
                ₹{(auction.currentPrice ?? 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <Users className="w-3 h-3" />
                <span>{auction.totalBids ?? 0} bids</span>
              </div>
              {auction.endTime && auction.status === "active" && (
                <CountdownTimer endTime={auction.endTime} compact />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
            <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700 overflow-hidden shrink-0">
              {sellerImage
                ? <img src={sellerImage} alt={sellerName} className="w-full h-full object-cover" />
                : sellerName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-500 truncate flex-1">{sellerName}</span>
            {/* ── null-safe rating ── */}
            <span className="ml-auto text-[10px] text-amber-500 font-semibold shrink-0">
              ★ {sellerRating.toFixed(1)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}