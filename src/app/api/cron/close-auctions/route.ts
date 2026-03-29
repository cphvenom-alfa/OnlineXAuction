import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { auction, bid, transaction, notification } from "@/server/db/schema";
import { and, eq, lte, desc } from "drizzle-orm";
 
export async function GET(req: Request) {
  // Secure with a secret token
  const url    = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
 
  try {
    const now = new Date();
 
    // Find all active auctions whose endTime has passed
    const expiredAuctions = await db.query.auction.findMany({
      where: and(
        eq(auction.status, "active"),
        lte(auction.endTime, now),
      ),
      with: {
        bids: {
          orderBy: desc(bid.amount),
          limit: 1,
        },
      },
    });
 
    let closed = 0;
 
    for (const a of expiredAuctions) {
      const winningBid = (a.bids as any[])[0];
 
      if (winningBid) {
        // Has a winner — close and create transaction
        await db.update(auction)
          .set({
            status:    "ended",
            winnerId:  winningBid.bidderId,
            updatedAt: now,
          })
          .where(eq(auction.id, a.id));
 
        // Create transaction record
        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        await db.insert(transaction).values({
          auctionId:     a.id,
          buyerId:       winningBid.bidderId,
          sellerId:      a.sellerId,
          amount:        winningBid.amount,
          paymentStatus: "pending",
          invoiceNumber,
        });
 
        // Notify winner
        await db.insert(notification).values({
          userId:    winningBid.bidderId,
          title:     "🏆 You won the auction!",
          body:      `Congratulations! You won "${a.title}" with a bid of ₹${winningBid.amount.toFixed(0)}. Please complete payment.`,
          type:      "won",
          auctionId: a.id,
        });
 
        // Notify seller
        await db.insert(notification).values({
          userId:    a.sellerId,
          title:     "Auction ended — item sold!",
          body:      `Your auction "${a.title}" ended. Winning bid: ₹${winningBid.amount.toFixed(0)}. Awaiting buyer payment.`,
          type:      "auction_ended",
          auctionId: a.id,
        });
      } else {
        // No bids — close without winner
        await db.update(auction)
          .set({ status: "ended", updatedAt: now })
          .where(eq(auction.id, a.id));
 
        // Notify seller
        await db.insert(notification).values({
          userId:    a.sellerId,
          title:     "Auction ended — no bids",
          body:      `Your auction "${a.title}" ended without any bids. You can relist it from your dashboard.`,
          type:      "auction_ended",
          auctionId: a.id,
        });
      }
 
      closed++;
    }
 
    return NextResponse.json({ closed, timestamp: now.toISOString() });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
 