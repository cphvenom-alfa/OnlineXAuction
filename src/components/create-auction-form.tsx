"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useUploadThing } from "@/utils/uploadthing";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

const CATEGORIES = [
  "electronics","fashion","art","collectibles","vehicles",
  "real_estate","jewelry","books","sports","home_garden","toys","other",
] as const;

export function CreateAuctionForm({ auctionId }: { auctionId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", category: "electronics" as any,
    basePrice: "", reservePrice: "", buyNowPrice: "",
    endTime: "", startNow: false,
  });
  const [images, setImages]       = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("auctionImage", {
    onClientUploadComplete: (res: any[]) => {
      setImages(prev => [...prev, ...res.map((r: { url: any; }) => r.url)]);
      setUploading(false);
    },
    onUploadError: () => setUploading(false),
  });

  const create = api.auction.create.useMutation({
    onSuccess: (a) => router.push("/seller/dashboard"),
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    void startUpload(files);
  }

  function handleSubmit(startNow: boolean) {
    if (!form.title || !form.description || !form.basePrice || !form.endTime || images.length === 0) return;
    create.mutate({
      title:        form.title,
      description:  form.description,
      category:     form.category,
      images,
      basePrice:    parseFloat(form.basePrice),
      reservePrice: form.reservePrice ? parseFloat(form.reservePrice) : undefined,
      buyNowPrice:  form.buyNowPrice  ? parseFloat(form.buyNowPrice)  : undefined,
      endTime:      form.endTime,
      startNow,
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      {/* Images */}
      <div>
        {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-sm font-semibold text-gray-700 mb-2">Product Images *</label>
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
<div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
              <img src={img} alt={`img-${i}`} className="w-full h-full object-cover" />
              <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {images.length < 8 && (
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-500 transition disabled:opacity-50">
              <Upload className="w-5 h-5" />
              <span className="text-[10px] mt-1">{uploading ? "..." : "Add"}</span>
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
      </div>

      <div>
        {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
        <input type="text" placeholder="Enter auction title" required
          value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-purple-500 focus:bg-white focus:outline-none transition" />
      </div>

      <div>
        {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
        <textarea rows={4} placeholder="Describe your item in detail..."
          value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-purple-500 focus:bg-white focus:outline-none transition resize-none" />
      </div>

      <div>
        {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
        <Select value={form.category} onValueChange={val => setForm(p => ({ ...p, category: val as any }))}>
          <SelectTrigger className="w-full rounded-xl border-gray-200 bg-gray-50 h-12 text-sm capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-sm font-semibold text-gray-700 mb-1.5">Starting Price (₹) *</label>
          <input type="number" min="1" step="1" placeholder="0"
            value={form.basePrice} onChange={e => setForm(p => ({ ...p, basePrice: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-purple-500 focus:bg-white focus:outline-none transition" />
        </div>
        <div>
          {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-sm font-semibold text-gray-700 mb-1.5">Reserve Price (₹)</label>
          <input type="number" min="1" step="1" placeholder="Optional"
            value={form.reservePrice} onChange={e => setForm(p => ({ ...p, reservePrice: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-purple-500 focus:bg-white focus:outline-none transition" />
        </div>
        <div>
          {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-sm font-semibold text-gray-700 mb-1.5">Buy Now Price (₹)</label>
          <input type="number" min="1" step="1" placeholder="Optional"
            value={form.buyNowPrice} onChange={e => setForm(p => ({ ...p, buyNowPrice: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-purple-500 focus:bg-white focus:outline-none transition" />
        </div>
      </div>

      <div>
        {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-sm font-semibold text-gray-700 mb-1.5">End Date & Time *</label>
        <input type="datetime-local"
          value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-purple-500 focus:bg-white focus:outline-none transition" />
      </div>

      {create.error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{create.error.message}</p>}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={() => handleSubmit(false)}
          disabled={create.isPending || uploading || !form.title || !form.basePrice || images.length === 0}
          className="flex-1 rounded-xl h-12 text-sm font-bold border-gray-200">
          Save as Draft
        </Button>
        <Button onClick={() => handleSubmit(true)}
          disabled={create.isPending || uploading || !form.title || !form.basePrice || images.length === 0}
          className="flex-1 rounded-xl h-12 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 disabled:opacity-50">
          {create.isPending ? "Submitting..." : "Submit for Approval"}
        </Button>
      </div>
    </div>
  );
}
