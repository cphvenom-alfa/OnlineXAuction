"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { usePusher } from "@/hooks/use-pusher";
import { CountdownTimer } from "./countdown-timer";
import { Gavel, Heart, Users, Eye, Share2, Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/server/better-auth/client";
import Link from "next/link";

type Auction = {
  id: string; title: string; description: string; images: string[];
  category: string; currentPrice: number; basePrice: number;
  totalBids: number; endTime: Date | null; status: string;
  buyNowPrice: number | null; reservePrice: number | null;
  isWatched: boolean; viewCount: number;
  seller: { id: string; name: string; image: string | null; rating: number; totalSales: number; bio: string | null };
  winner: { id: string; name: string; image: string | null } | null;
  bids: Array<{ id: string; amount: number; createdAt: Date; isWinning: boolean; bidder: { id: string; name: string; image: string | null } }>;
};

export function AuctionDetailClient({ auction: initial }: { auction: Auction }) {
  const { data: session } = useSession();
  const router = useRouter();
  const utils  = api.useUtils();

  const [auction, setAuction]   = useState(initial);
  const [bidAmount, setBidAmount] = useState("");
  const [watched, setWatched]   = useState(initial.isWatched);
  const [activeImg, setActiveImg] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [justBid, setJustBid] = useState(false);

  const minBid = auction.currentPrice + (auction.currentPrice < 1000 ? 10 : auction.currentPrice < 10000 ? 100 : 500);

  const placeBid = api.bid.place.useMutation({
    onSuccess: () => {
      setBidAmount("");
      setJustBid(true);
      setTimeout(() => setJustBid(false), 3000);
      void utils.auction.byId.invalidate({ id: auction.id });
    },
  });

  const toggleWatch = api.auction.toggleWatchlist.useMutation({
    onSuccess: (data) => setWatched(data.watching),
  });

  // Real-time Pusher updates
  usePusher(`auction-${auction.id}`, {
    "new-bid": (data: any) => {
      setAuction(prev => ({
        ...prev,
        currentPrice: data.currentPrice,
        totalBids:    data.totalBids,
        bids: [{ ...data.bid, bidder: data.bidder, isWinning: true }, ...prev.bids.map(b => ({ ...b, isWinning: false }))],
      }));
    },
  });

  const isActive   = auction.status === "active";
  const isEnded    = auction.status === "ended";
  const canBid     = isActive && session?.user && session.user.id !== auction.seller.id;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-3 gap-8">
        {/* Left: Images */}
        <div className="col-span-2 space-y-4">
          <div className="relative overflow-hidden rounded-3xl bg-gray-100 aspect-[16/10]">
            {auction.images[activeImg] ? (
              <img src={auction.images[activeImg]} alt={auction.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🔨</div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <span className="rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold capitalize text-white backdrop-blur">
                {auction.category.replace(/_/g, " ")}
              </span>
              {auction.status === "active" && (
                <span className="rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white">
                  LIVE
                </span>
              )}
              {auction.status === "ended" && (
                <span className="rounded-full bg-gray-600 px-3 py-1.5 text-xs font-bold text-white">
                  ENDED
                </span>
              )}
            </div>
          </div>

          {auction.images.length > 1 && (
            <div className="flex gap-2">
              {auction.images.map((img, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
<button key={i} type="button" onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                    activeImg === i ? "border-purple-500" : "border-transparent"
                  }`}>
                  {/** biome-ignore lint/performance/noImgElement: <explanation> */}
{/** biome-ignore lint/a11y/noRedundantAlt: <explanation> */}
<img src={img} alt={`Image ${i+1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{auction.description}</p>
          </div>

          {/* Seller info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-3">Seller Information</h2>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-lg font-bold text-purple-700 overflow-hidden shrink-0">
                {auction.seller.image
                  ? <img src={auction.seller.image} alt={auction.seller.name} className="w-full h-full object-cover" />
                  : auction.seller.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900">{auction.seller.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-sm text-gray-500">{auction.seller.rating.toFixed(1)} · {auction.seller.totalSales} sales</span>
                </div>
                {auction.seller.bio && <p className="text-sm text-gray-500 mt-1">{auction.seller.bio}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Bid panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h1 className="text-xl font-black text-gray-900 mb-4 leading-tight">{auction.title}</h1>

            <div className="flex items-center gap-4 text-xs text-gray-400 mb-5">
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {auction.viewCount} views</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {auction.totalBids} bids</span>
            </div>

            {/* Timer */}
            {isActive && auction.endTime && (
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Time Remaining</p>
                <CountdownTimer endTime={auction.endTime} />
              </div>
            )}

            {/* Current price */}
            <div className="rounded-2xl bg-purple-50 border border-purple-100 p-4 mb-4">
              <p className="text-xs text-purple-500 font-semibold">Current Bid</p>
              <p className="text-3xl font-black text-purple-700 mt-0.5">
                ₹{auction.currentPrice.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Base price: ₹{auction.basePrice.toLocaleString("en-IN")}</p>
            </div>

            {auction.buyNowPrice && isActive && (
              <div className="rounded-2xl bg-green-50 border border-green-100 p-3 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-semibold">Buy Now Price</p>
                  <p className="text-xl font-black text-green-700">₹{auction.buyNowPrice.toLocaleString("en-IN")}</p>
                </div>
              </div>
            )}

            {/* Winner display */}
            {isEnded && auction.winner && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mb-4 text-center">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">🏆 Auction Winner</p>
                <p className="font-black text-gray-900 mt-1">{auction.winner.name}</p>
              </div>
            )}

            {/* Bid form */}
            {canBid && (
              <div className="space-y-3">
                <div>
                  {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Your Bid (Min: ₹{minBid.toLocaleString("en-IN")})
                  </label>
                  <div className="flex gap-2">
                    <input type="number" min={minBid} step="1"
                      placeholder={`₹${minBid.toLocaleString("en-IN")}`}
                      value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                      className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-purple-500 focus:bg-white focus:outline-none transition font-bold" />
                    <Button onClick={() => placeBid.mutate({ auctionId: auction.id, amount: parseFloat(bidAmount) })}
                      disabled={!bidAmount || parseFloat(bidAmount) < minBid || placeBid.isPending}
                      className="rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold px-5 shrink-0 disabled:opacity-50">
                      <Gavel className="w-4 h-4 mr-1.5" />
                      {placeBid.isPending ? "..." : "Bid"}
                    </Button>
                  </div>
                </div>
                {/* Quick bid buttons */}
                <div className="flex gap-2">
                  {[minBid, minBid + 100, minBid + 500].map(amt => (
                    <button key={amt} type="button" onClick={() => setBidAmount(amt.toString())}
                      className="flex-1 rounded-xl border border-purple-200 bg-purple-50 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100 transition">
                      ₹{amt.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
                {placeBid.error && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{placeBid.error.message}</p>
                )}
                {justBid && (
                  <p className="text-sm text-green-600 bg-green-50 rounded-xl px-3 py-2 font-semibold">
                    ✅ Bid placed successfully!
                  </p>
                )}
              </div>
            )}

            {!session?.user && isActive && (
              <Link href="/sign-in">
                <Button className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold h-12">
                  Sign in to Bid
                </Button>
              </Link>
            )}

            {/* Watch + Share */}
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={() => toggleWatch.mutate({ auctionId: auction.id })}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition ${
                  watched ? "border-red-200 bg-red-50 text-red-500" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}>
                <Heart className={`w-4 h-4 ${watched ? "fill-red-500" : ""}`} />
                {watched ? "Watching" : "Watch"}
              </button>
              <button type="button" onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>

          {/* Bid history */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button type="button" onClick={() => setShowHistory(v => !v)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-black text-gray-900 hover:bg-gray-50">
              <span>Bid History ({auction.totalBids})</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showHistory ? "rotate-180" : ""}`} />
            </button>
            {showHistory && (
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                {auction.bids.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-gray-400 text-center">No bids yet. Be the first!</p>
                ) : (
                  auction.bids.map((b, i) => (
                    <div key={b.id} className={`flex items-center gap-3 px-5 py-3 ${i === 0 ? "bg-purple-50" : ""}`}>
                      <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700 overflow-hidden shrink-0">
                        {b.bidder.image
                          ? <img src={b.bidder.image} alt={b.bidder.name} className="w-full h-full object-cover" />
                          : b.bidder.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-800">{b.bidder.name}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(b.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-sm ${i === 0 ? "text-purple-700" : "text-gray-600"}`}>
                          ₹{b.amount.toLocaleString("en-IN")}
                        </p>
                        {i === 0 && <p className="text-[10px] text-green-600 font-semibold">Highest</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

