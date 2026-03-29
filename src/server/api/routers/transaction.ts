 
// ============================================================
// src/server/api/routers/transaction.ts
// ============================================================
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { transaction, auction, notification, user } from "@/server/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
 
export const transactionRouter = createTRPCRouter({
 
  myBuyerTransactions: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.transaction.findMany({
      where: eq(transaction.buyerId, ctx.session.user.id),
      with: {
        auction: { columns: { id: true, title: true, images: true } },
        seller:  { columns: { id: true, name: true }  },
      },
      orderBy: desc(transaction.createdAt),
    });
  }),
 
  mySellerTransactions: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.transaction.findMany({
      where: eq(transaction.sellerId, ctx.session.user.id),
      with: {
        auction: { columns: { id: true, title: true, images: true } },
        buyer:   { columns: { id: true, name: true } },
      },
      orderBy: desc(transaction.createdAt),
    });
  }),
 
  pay: protectedProcedure
    .input(z.object({ transactionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const txn = await ctx.db.query.transaction.findFirst({
        where: and(eq(transaction.id, input.transactionId), eq(transaction.buyerId, ctx.session.user.id)),
        with:  { auction: { columns: { title: true } } },
      });
      if (!txn) throw new TRPCError({ code: "NOT_FOUND" });
      if (txn.paymentStatus !== "pending") throw new TRPCError({ code: "BAD_REQUEST", message: "Already processed" });
 
      // Dummy payment — mark as paid
      await ctx.db.update(transaction)
        .set({ paymentStatus: "paid", paidAt: new Date(), updatedAt: new Date() })
        .where(eq(transaction.id, input.transactionId));
 
      // Notify seller
      await ctx.db.insert(notification).values({
        userId:    txn.sellerId,
        title:     "Payment received",
        body:      `Buyer paid ₹${txn.amount.toFixed(0)} for "${(txn.auction as any)?.title}"`,
        type:      "payment",
        auctionId: txn.auctionId,
      });
      return { success: true };
    }),
 
  markShipped: protectedProcedure
    .input(z.object({ transactionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const txn = await ctx.db.query.transaction.findFirst({
        where: and(eq(transaction.id, input.transactionId), eq(transaction.sellerId, ctx.session.user.id)),
        with:  { auction: { columns: { title: true } } },
      });
      if (!txn) throw new TRPCError({ code: "NOT_FOUND" });
      if (txn.paymentStatus !== "paid") throw new TRPCError({ code: "BAD_REQUEST", message: "Payment not confirmed yet" });
 
      await ctx.db.update(transaction)
        .set({ shipStatus: "shipped", shippedAt: new Date(), updatedAt: new Date() })
        .where(eq(transaction.id, input.transactionId));
 
      await ctx.db.insert(notification).values({
        userId:    txn.buyerId,
        title:     "Item shipped!",
        body:      `Your item "${(txn.auction as any)?.title}" has been shipped`,
        type:      "shipped",
        auctionId: txn.auctionId,
      });
      return { success: true };
    }),
});
 