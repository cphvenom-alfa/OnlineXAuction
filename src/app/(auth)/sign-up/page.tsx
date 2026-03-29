"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/server/better-auth/client";
import { Gavel } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", role: "buyer", phone: "",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    const { error } = await signUp.email({ name: form.name, email: form.email, password: form.password });
    if (error) { setError(error.message ?? "Registration failed"); setLoading(false); return; }
    // Set role via API
    await fetch("/api/auth/set-role", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: form.role }),
    });
    router.push(form.role === "seller" ? "/seller/dashboard" : "/auctions");
    setLoading(false);
  }

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center mb-4 shadow-lg">
          <Gavel className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Syne', sans-serif" }}>Create Account</h1>
        <p className="text-sm text-gray-400 mt-1">Join BidHub today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input type="text" placeholder="Your name" required
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none transition" />
          </div>
          <div>
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
            <input type="tel" placeholder="+91 ..."
              value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none transition" />
          </div>
        </div>
        <div>
          {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
          <input type="email" placeholder="you@example.com" required
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none transition" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" placeholder="Min 6 chars" required minLength={6}
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none transition" />
          </div>
          <div>
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
            <input type="password" placeholder="Repeat password" required
              value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none transition" />
          </div>
        </div>

        {/* Role selection */}
        <div>
          {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
<label className="block text-xs font-semibold text-gray-700 mb-2">I want to</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "buyer",  label: "Buy items",  emoji: "🛒" },
              { value: "seller", label: "Sell items", emoji: "🏷️" },
            ].map(r => (
              <button key={r.value} type="button"
                onClick={() => setForm(p => ({ ...p, role: r.value }))}
                className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                  form.role === r.value
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}>
                <span>{r.emoji}</span> {r.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full rounded-xl py-3.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-50 transition shadow-md">
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-purple-600 font-semibold hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
