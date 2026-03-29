
// ============================================================
// src/server/api/routers/bid.ts
// ============================================================
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { bid, auction, notification, transaction, user } from "@/server/db/schema";
import { and, eq, desc, ne } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import Pusher from "pusher";
 
const pusher = new Pusher({
  appId:   process.env.PUSHER_APP_ID!,
  key:     process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret:  process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS:  true,
});
 
export const bidRouter = createTRPCRouter({
 
  // Place a bid
  place: protectedProcedure
    .input(z.object({
      auctionId: z.string().uuid(),
      amount:    z.number().positive(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbUser = await ctx.db.query.user.findFirst({
        where: eq(user.id, ctx.session.user.id),
        columns: { role: true, isSuspended: true },
      });
      if (dbUser?.isSuspended) throw new TRPCError({ code: "FORBIDDEN", message: "Your account is suspended" });
 
      const a = await ctx.db.query.auction.findFirst({
        where: eq(auction.id, input.auctionId),
        with: { bids: { orderBy: desc(bid.amount), limit: 1 } },
      });
      if (!a) throw new TRPCError({ code: "NOT_FOUND" });
      if (a.status !== "active") throw new TRPCError({ code: "BAD_REQUEST", message: "Auction is not active" });
      if (a.sellerId === ctx.session.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot bid on your own auction" });
      if (a.endTime && new Date() > a.endTime) throw new TRPCError({ code: "BAD_REQUEST", message: "Auction has ended" });
 
      const minBid = a.currentPrice + (a.currentPrice < 1000 ? 10 : a.currentPrice < 10000 ? 100 : 500);
      if (input.amount < minBid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Minimum bid is ₹${minBid.toFixed(0)}` });
      }
 
      // Get previous highest bidder
      const prevHighest = a.bids[0];
      const prevBidderId = prevHighest?.bidderId;
 
      // Mark all previous bids as not winning
      await ctx.db.update(bid)
        .set({ isWinning: false })
        .where(eq(bid.auctionId, input.auctionId));
 
      // Insert new bid
      const [newBid] = await ctx.db.insert(bid).values({
        auctionId: input.auctionId,
        bidderId:  ctx.session.user.id,
        amount:    input.amount,
        isWinning: true,
      }).returning();
 
      // Update auction current price + bid count
      await ctx.db.update(auction)
        .set({ currentPrice: input.amount, totalBids: a.totalBids + 1, updatedAt: new Date() })
        .where(eq(auction.id, input.auctionId));
 
      // Get bidder info
      const bidder = await ctx.db.query.user.findFirst({
        where: eq(user.id, ctx.session.user.id),
        columns: { id: true, name: true, image: true },
      });
 
      // Pusher: broadcast new bid to auction channel
      await pusher.trigger(`auction-${input.auctionId}`, "new-bid", {
        bid:          newBid,
        bidder,
        currentPrice: input.amount,
        totalBids:    a.totalBids + 1,
      });
 
      // Notify outbid user
      if (prevBidderId && prevBidderId !== ctx.session.user.id) {
        await ctx.db.insert(notification).values({
          userId:    prevBidderId,
          title:     "You've been outbid!",
          body:      `Someone placed a higher bid of ₹${input.amount.toFixed(0)} on "${a.title}"`,
          type:      "outbid",
          auctionId: input.auctionId,
        });
        await pusher.trigger(`user-${prevBidderId}`, "outbid", {
          auctionId: input.auctionId,
          title:     a.title,
          newAmount: input.amount,
        });
      }
 
      // Notify seller of new bid
      await ctx.db.insert(notification).values({
        userId:    a.sellerId,
        title:     "New bid on your auction",
        body:      `${bidder?.name} placed a bid of ₹${input.amount.toFixed(0)} on "${a.title}"`,
        type:      "new_bid",
        auctionId: input.auctionId,
      });
 
      // Check buy-now
      if (a.buyNowPrice && input.amount >= a.buyNowPrice) {
        await ctx.db.update(auction)
          .set({ status: "ended", winnerId: ctx.session.user.id, updatedAt: new Date() })
          .where(eq(auction.id, input.auctionId));
        await createTransaction(ctx.db, input.auctionId, ctx.session.user.id, a.sellerId, input.amount);
      }
 
      return newBid;
    }),
 
  // Bid history for an auction
  history: publicProcedure
    .input(z.object({ auctionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.bid.findMany({
        where: eq(bid.auctionId, input.auctionId),
        with:  { bidder: { columns: { id: true, name: true, image: true } } },
        orderBy: desc(bid.amount),
        limit: 50,
      });
    }),
 
  // My bid history
  myBids: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.bid.findMany({
      where: eq(bid.bidderId, ctx.session.user.id),
      with:  { auction: { with: { seller: { columns: { id: true, name: true } } } } },
      orderBy: desc(bid.createdAt),
    });
  }),
});
 
async function createTransaction(db: any, auctionId: string, buyerId: string, sellerId: string, amount: number) {
  const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  await db.insert(transaction).values({
    auctionId, buyerId, sellerId, amount,
    paymentStatus: "pending",
    invoiceNumber,
  });
}
 