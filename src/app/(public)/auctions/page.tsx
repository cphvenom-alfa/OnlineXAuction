"use client";
import { useState } from "react";
import { api } from "@/trpc/react";
import { AuctionCard } from "@/components/auction-card";
import { Search, SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = [
  "all","electronics","fashion","art","collectibles","vehicles",
  "real_estate","jewelry","books","sports","home_garden","toys","other",
];
const SORT_OPTIONS = [
  { value: "newest",       label: "Newest First"   },
  { value: "ending_soon",  label: "Ending Soon"    },
  { value: "price_asc",    label: "Price: Low-High"},
  { value: "price_desc",   label: "Price: High-Low"},
  { value: "most_bids",    label: "Most Bids"      },
];

export default function BrowsePage() {
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy,   setSortBy]   = useState<any>("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { data: featured = [] } = api.auction.featured.useQuery();
  const { data: auctions = [], isLoading } = api.auction.list.useQuery({
    search:   search   || undefined,
    category: category !== "all" ? category : undefined,
    sortBy,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Hero search */}
      <div className="rounded-3xl overflow-hidden relative bg-gradient-to-r from-purple-900 via-violet-800 to-purple-900 p-10 text-white">
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            Live Auctions
          </h1>
          <p className="text-purple-200 mb-6">Bid on thousands of unique items in real time</p>
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              className="w-full rounded-2xl bg-white py-3.5 pl-12 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"
              placeholder="Search auctions by name, category..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div>
          <h2 className="text-lg font-black text-gray-900 mb-4">⭐ Featured Auctions</h2>
          <div className="grid grid-cols-3 gap-4">
            {featured.map(a => <AuctionCard key={a.id} auction={a as any} featured />)}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c} type="button" onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                category === c ? "bg-purple-600 text-white shadow-md" : "bg-white border border-gray-200 text-gray-500 hover:border-purple-300"
              }`}>
              {c.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <input placeholder="Min ₹" value={minPrice} onChange={e => setMinPrice(e.target.value)}
            className="w-24 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs focus:border-purple-400 focus:outline-none" />
          <span className="text-gray-400 text-xs">—</span>
          <input placeholder="Max ₹" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
            className="w-24 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs focus:border-purple-400 focus:outline-none" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 rounded-xl border-gray-200 bg-white h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        </div>
      ) : auctions.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="text-5xl mb-3">🔨</span>
          <p className="text-gray-400">No auctions found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5 xl:grid-cols-4">
          {auctions.map(a => <AuctionCard key={a.id} auction={a as any} />)}
        </div>
      )}
    </div>
  );
}
