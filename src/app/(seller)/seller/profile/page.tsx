"use client";
import { useState, useEffect, useRef } from "react";
import { api } from "@/trpc/react";
import { useUploadThing } from "@/utils/uploadthing";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export default function SellerProfilePage() {
  const { data: profile, refetch } = api.profile.me.useQuery();
  const [form, setForm]   = useState({ name: "", phone: "", address: "", bio: "" });
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name ?? "", phone: profile.phone ?? "", address: profile.address ?? "", bio: profile.bio ?? "" });
      setAvatarUrl(profile.image ?? "");
    }
  }, [profile]);

  const { startUpload } = useUploadThing("userAvatar", {
    onClientUploadComplete: (res) => { setAvatarUrl(res[0]?.url ?? ""); setUploading(false); },
    onUploadError: () => setUploading(false),
  });

  const update = api.profile.update.useMutation({
    onSuccess: () => { void refetch(); setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Seller Profile</h1>
        {profile && (
          <div className="flex items-center gap-2 mt-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm text-gray-500">{profile.rating.toFixed(1)} rating · {profile.totalSales} sales</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-xl font-bold text-purple-700 overflow-hidden shrink-0">
            {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : profile?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold h-9 text-sm px-4">
              {uploading ? "Uploading..." : "Change Photo"}
            </Button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (!f) return; setUploading(true); void startUpload([f]); }} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-purple-500 focus:bg-white focus:outline-none transition" />
          </div>
          <div>
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
            <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-purple-500 focus:bg-white focus:outline-none transition" />
          </div>
        </div>
        <div>
          {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio (shown to buyers)</label>
          <textarea rows={3} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            placeholder="Tell buyers about yourself and what you sell..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-purple-500 focus:bg-white focus:outline-none transition resize-none" />
        </div>

        <Button onClick={() => update.mutate({ name: form.name, phone: form.phone, address: form.address, bio: form.bio, image: avatarUrl || undefined })}
          disabled={update.isPending || uploading}
          className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold h-11 px-8">
          {saved ? "Saved ✓" : update.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
