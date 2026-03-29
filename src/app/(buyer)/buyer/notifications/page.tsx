"use client";
import { api } from "@/trpc/react";
import { Bell, X } from "lucide-react";
import Link from "next/link";

const TYPE_CONFIG: Record<string, { bg: string; border: string; color: string; emoji: string }> = {
  outbid:           { bg: "bg-red-50",    border: "border-red-100",    color: "text-red-600",    emoji: "⚡" },
  new_bid:          { bg: "bg-blue-50",   border: "border-blue-100",   color: "text-blue-600",   emoji: "🔨" },
  won:              { bg: "bg-green-50",  border: "border-green-100",  color: "text-green-600",  emoji: "🏆" },
  payment:          { bg: "bg-teal-50",   border: "border-teal-100",   color: "text-teal-600",   emoji: "💳" },
  shipped:          { bg: "bg-purple-50", border: "border-purple-100", color: "text-purple-600", emoji: "📦" },
  auction_approved: { bg: "bg-green-50",  border: "border-green-100",  color: "text-green-600",  emoji: "✅" },
  auction_rejected: { bg: "bg-red-50",    border: "border-red-100",    color: "text-red-600",    emoji: "❌" },
};

function timeAgo(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  const h    = Math.floor(diff / 3600000);
  const d    = Math.floor(diff / 86400000);
  if (d >= 1)  return `${d}d ago`;
  if (h >= 1)  return `${h}h ago`;
  return "Just now";
}

export default function BuyerNotificationsPage() {
  const utils  = api.useUtils();
  const { data: notifications = [] } = api.notification.list.useQuery();

  const markAllRead = api.notification.markAllRead.useMutation({
    onSuccess: () => void utils.notification.list.invalidate(),
  });

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {unread > 0 ? `${unread} unread` : "All caught up"}
          </p>
        </div>
        {unread > 0 && (
          <button type="button" onClick={() => markAllRead.mutate()}
            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <Bell className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-gray-400">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const config = TYPE_CONFIG[n.type] ?? { bg: "bg-gray-50", border: "border-gray-100", color: "text-gray-500", emoji: "🔔" };
            return (
              <div key={n.id}
                className={`relative rounded-2xl border p-4 flex items-start gap-4 ${config.bg} ${config.border} ${!n.isRead ? "shadow-sm" : "opacity-75"}`}>
                <div className={`w-10 h-10 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center text-xl shrink-0`}>
                  {config.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${!n.isRead ? "text-gray-900" : "text-gray-600"}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-[11px] text-gray-400">{timeAgo(n.createdAt)}</p>
                    {n.auctionId && (
                      <Link href={`/auctions/${n.auctionId}`}
                        className={`text-[11px] font-semibold ${config.color} hover:underline`}>
                        View auction →
                      </Link>
                    )}
                  </div>
                </div>
                {!n.isRead && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-purple-500" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
