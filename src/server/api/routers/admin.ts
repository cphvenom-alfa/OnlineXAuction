
// ============================================================
// src/server/api/routers/admin.ts
// ============================================================
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { auction, user, transaction, bid, report, notification } from "@/server/db/schema";
import { eq, desc, count, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
 
function requireAdmin(ctx: any) {
  if (ctx.session?.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
  }
}
 
// IMPORTANT: We check role from DB not session
async function checkAdminRole(ctx: any) {
  const dbUser = await ctx.db.query.user.findFirst({
    where: eq(user.id, ctx.session.user.id),
    columns: { role: true },
  });
  if (dbUser?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
}
 
export const adminRouter = createTRPCRouter({
 
  stats: protectedProcedure.query(async ({ ctx }) => {
    await checkAdminRole(ctx);
    const [users, auctions, transactions, bids] = await Promise.all([
      ctx.db.query.user.findMany({ columns: { id: true, role: true, createdAt: true, isSuspended: true } }),
      ctx.db.query.auction.findMany({ columns: { id: true, status: true, createdAt: true } }),
      ctx.db.query.transaction.findMany({ columns: { id: true, amount: true, paymentStatus: true } }),
      ctx.db.query.bid.findMany({ columns: { id: true } }),
    ]);
    return {
      totalUsers:       users.length,
      totalBuyers:      users.filter(u => u.role === "buyer").length,
      totalSellers:     users.filter(u => u.role === "seller").length,
      suspendedUsers:   users.filter(u => u.isSuspended).length,
      totalAuctions:    auctions.length,
      activeAuctions:   auctions.filter(a => a.status === "active").length,
      pendingApproval:  auctions.filter(a => a.status === "pending_approval").length,
      totalTransactions: transactions.length,
      totalRevenue:     transactions.filter(t => t.paymentStatus === "paid").reduce((s, t) => s + t.amount, 0),
      totalBids:        bids.length,
    };
  }),
 
  allUsers: protectedProcedure
    .input(z.object({ search: z.string().optional(), role: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      await checkAdminRole(ctx);
      return ctx.db.query.user.findMany({
        columns: { id: true, name: true, email: true, role: true, isSuspended: true, isVerified: true, createdAt: true },
        orderBy: desc(user.createdAt),
      });
    }),
 
  suspendUser: protectedProcedure
    .input(z.object({ userId: z.string(), suspend: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await checkAdminRole(ctx);
      await ctx.db.update(user)
        .set({ isSuspended: input.suspend, updatedAt: new Date() })
        .where(eq(user.id, input.userId));
    }),
 
  setRole: protectedProcedure
    .input(z.object({ userId: z.string(), role: z.enum(["buyer","seller","admin"]) }))
    .mutation(async ({ ctx, input }) => {
      await checkAdminRole(ctx);
      await ctx.db.update(user)
        .set({ role: input.role, updatedAt: new Date() })
        .where(eq(user.id, input.userId));
    }),
 
  pendingAuctions: protectedProcedure.query(async ({ ctx }) => {
    await checkAdminRole(ctx);
    return ctx.db.query.auction.findMany({
      where: eq(auction.status, "pending_approval"),
      with:  { seller: { columns: { id: true, name: true, email: true } } },
      orderBy: desc(auction.createdAt),
    });
  }),
 
  allAuctions: protectedProcedure.query(async ({ ctx }) => {
    await checkAdminRole(ctx);
    return ctx.db.query.auction.findMany({
      with: { seller: { columns: { id: true, name: true } } },
      orderBy: desc(auction.createdAt),
      limit: 100,
    });
  }),
 
  approveAuction: protectedProcedure
    .input(z.object({ id: z.string().uuid(), note: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      await checkAdminRole(ctx);
      const a = await ctx.db.query.auction.findFirst({ where: eq(auction.id, input.id) });
      if (!a) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.db.update(auction)
        .set({ status: "active", adminNote: input.note, updatedAt: new Date() })
        .where(eq(auction.id, input.id));
      await ctx.db.insert(notification).values({
        userId:    a.sellerId,
        title:     "Auction Approved! ✅",
        body:      `Your auction "${a.title}" is now live`,
        type:      "auction_approved",
        auctionId: a.id,
      });
    }),
 
  rejectAuction: protectedProcedure
    .input(z.object({ id: z.string().uuid(), note: z.string().min(5) }))
    .mutation(async ({ ctx, input }) => {
      await checkAdminRole(ctx);
      const a = await ctx.db.query.auction.findFirst({ where: eq(auction.id, input.id) });
      if (!a) throw new TRPCError({ code: "NOT_FOUND" });
      await ctx.db.update(auction)
        .set({ status: "cancelled", adminNote: input.note, updatedAt: new Date() })
        .where(eq(auction.id, input.id));
      await ctx.db.insert(notification).values({
        userId:    a.sellerId,
        title:     "Auction Rejected",
        body:      `Your auction "${a.title}" was rejected. Reason: ${input.note}`,
        type:      "auction_rejected",
        auctionId: a.id,
      });
    }),
 
  featureAuction: protectedProcedure
    .input(z.object({ id: z.string().uuid(), featured: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await checkAdminRole(ctx);
      await ctx.db.update(auction).set({ isFeatured: input.featured }).where(eq(auction.id, input.id));
    }),
 
  allTransactions: protectedProcedure.query(async ({ ctx }) => {
    await checkAdminRole(ctx);
    return ctx.db.query.transaction.findMany({
      with: {
        auction: { columns: { id: true, title: true } },
        buyer:   { columns: { id: true, name: true } },
        seller:  { columns: { id: true, name: true } },
      },
      orderBy: desc(transaction.createdAt),
      limit: 100,
    });
  }),
 
  allReports: protectedProcedure.query(async ({ ctx }) => {
    await checkAdminRole(ctx);
    return ctx.db.query.report.findMany({
      with: { reporter: { columns: { id: true, name: true, email: true } } },
      orderBy: desc(report.createdAt),
    });
  }),
 
  resolveReport: protectedProcedure
    .input(z.object({ id: z.string().uuid(), status: z.enum(["resolved","dismissed"]), note: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      await checkAdminRole(ctx);
      await ctx.db.update(report)
        .set({ status: input.status, adminNote: input.note, updatedAt: new Date() })
        .where(eq(report.id, input.id));
    }),
});
 