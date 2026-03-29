"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/server/better-auth/client";
import { Gavel, Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error } = await signIn.email({ email: form.email, password: form.password });
    setLoading(false);
    if (error) { setError("Invalid email or password."); return; }
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json() as { role?: string };
      if (data.role === "admin") router.push("/admin/dashboard");
      else if (data.role === "seller") router.push("/seller/dashboard");
      else router.push("/auctions");
    } catch { router.push("/auctions"); }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center mb-4 shadow-lg">
          <Gavel className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>
          BidHub
        </h1>
        <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
          <input type="email" placeholder="you@example.com" required
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 transition" />
        </div>
        <div>
          {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input type={showPw ? "text" : "password"} placeholder="••••••••" required
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 transition" />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full rounded-xl py-3.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-50 transition shadow-md">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        No account?{" "}
        <Link href="/sign-up" className="text-purple-600 font-semibold hover:underline">Create one</Link>
      </p>
    </div>
  );
}

