import Link from "next/link";

// ─── Floating UI components for BidHub ────────────────────────────────────────

function LiveAuctionCard() {
  return (
    <div className="absolute -left-4 top-16 w-56 rotate-[-6deg] rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 animate-pulse">
          LIVE
        </span>
        <span className="text-[10px] font-mono text-gray-400">04:12:09</span>
      </div>
      <p className="text-xs font-bold text-gray-900">Vintage Leica M6</p>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
          <span className="text-[10px] text-gray-500">Current Bid</span>
          <span className="text-xs font-bold text-emerald-600">$2,450</span>
        </div>
        {/** biome-ignore lint/nursery/useSortedClasses: <explanation> */}
{/** biome-ignore lint/a11y/useButtonType: <explanation> */}
<button className="w-full rounded-lg bg-gray-900 py-1.5 text-[10px] font-semibold text-white">
          Place Quick Bid
        </button>
      </div>
    </div>
  );
}

function SecurityCard() {
  return (
    <div className="absolute -right-6 top-8 w-52 rotate-[5deg] rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-blue-500">
        Escrow Protected
      </p>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-gray-600">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-50 text-blue-500">✓</span>
          SSL Encrypted
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-600">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-50 text-blue-500">✓</span>
          Funds Held Securely
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-600">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-50 text-blue-500">✓</span>
          Identity Verified
        </div>
      </div>
    </div>
  );
}

function WinningCard() {
  return (
    <div className="absolute -bottom-4 left-1/2 w-56 -translate-x-1/2 rotate-[1deg] rounded-2xl bg-emerald-500 p-4 shadow-xl ring-1 ring-black/5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
          🏆
        </div>
        <div>
          <p className="text-[10px] font-medium text-emerald-100 uppercase">Auction Won</p>
          <p className="text-xs font-bold text-white">Invoice Generated #BH-892</p>
        </div>
      </div>
    </div>
  );
}

// ─── Content Data ────────────────────────────────────────────────────────────

const features = [
  {
    num: "01",
    title: "Secure Identity",
    desc: "Role-based access for Buyers and Sellers with encrypted profile management.",
    color: "bg-blue-50 text-blue-600 ring-blue-100",
  },
  {
    num: "02",
    title: "Real-time Bidding",
    desc: "WebSocket-powered dynamic updates. Never miss a bid with instant notifications.",
    color: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  },
  {
    num: "03",
    title: "Escrow Payments",
    desc: "Integrated Razorpay/PayPal flow. Funds are only released when items ship.",
    color: "bg-violet-50 text-violet-600 ring-violet-100",
  },
  {
    num: "04",
    title: "Admin Moderation",
    desc: "A powerful dashboard to resolve disputes, approve listings, and monitor fraud.",
    color: "bg-amber-50 text-amber-600 ring-amber-100",
  },
];

const techStack = [
  { icon: "🛡️", title: "SSL & Protection", desc: "Hardened against SQLi, XSS, and CSRF attacks." },
  { icon: "⚡", title: "Live Updates", desc: "Dynamic bid increments using AJAX/Socket.io." },
  { icon: "📦", title: "Auction Engine", desc: "Automated closing, winner detection, and relisting." },
  { icon: "📱", title: "Responsive Discovery", desc: "Search, filter, and bid from any device smoothly." },
  { icon: "📑", title: "Automated Invoices", desc: "Professional PDF invoices generated per transaction." },
  { icon: "🔍", title: "Audit History", desc: "Full bid transparency with immutable history records." },
];

export default function BidHubLanding() {
  return (
    <div className="min-h-screen font-sans bg-[#fcfcf9]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Instrument Serif', serif; }
      `}</style>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-2xl italic text-gray-900">
            Bid<span className="text-emerald-600">Hub</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/sign-in" className="text-sm font-medium text-gray-500 hover:text-gray-900">Log in</Link>
            <Link href="/sign-up" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700">
              Start Selling
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32 pt-24 overflow-visible">
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            <LiveAuctionCard />
            <SecurityCard />
            <WinningCard />
          </div>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5">
            <span className="text-xs font-medium text-emerald-600">Now with Real-time WebSocket Bidding</span>
          </div>

          <h1 className="font-display mb-6 text-[4rem] italic leading-[1.05] tracking-tight text-gray-900 sm:text-[5.5rem]">
            The auction floor, <br />
            <span className="text-gray-400">reimagined.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-gray-500">
            A secure, real-time marketplace for collectors and sellers. 
            From automated winner detection to escrow-protected payments, 
            BidHub handles the complexity so you can focus on the win.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/sign-up" className="rounded-xl bg-emerald-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700">
              Create Account →
            </Link>
            <Link href="/sign-up" className="rounded-xl border border-gray-300 bg-white px-7 py-3.5 text-sm font-medium text-gray-700 hover:shadow-md">
              Browse Auctions
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-white py-24 border-y border-black/5">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.num} className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <div className={`mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ring-4 ${f.color}`}>
                  {f.num}
                </div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900">{f.title}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech/Trust Section */}
      <section className="py-24 bg-[#fcfcf9]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="font-display text-4xl italic text-gray-900">Engineered for Transparency</h2>
            <p className="mt-2 text-gray-500 text-sm">Every epic detail covered, from security to deployment.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {techStack.map((t) => (
              <div key={t.title} className="group">
                <span className="mb-3 block text-2xl">{t.icon}</span>
                <h3 className="mb-1 text-sm font-semibold text-gray-900">{t.title}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <span className="font-display text-xl italic">BidHub</span>
          <p className="text-[10px] uppercase tracking-widest text-gray-500">
            Secure · Real-time · Verified
          </p>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link href="/docs" className="hover:text-white">Documentation</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}