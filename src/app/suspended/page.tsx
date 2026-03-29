import Link from "next/link";
export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <span className="mb-4 block text-6xl">🚫</span>
        <h1 className="text-2xl font-black text-gray-900">Account Suspended</h1>
        <p className="mt-2 text-gray-500">Your account has been suspended. Contact support for assistance.</p>
        <Link href="/sign-in" className="mt-6 inline-block rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-bold text-white">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}