// ============================================================
// src/server/api/routers/auction.ts
// ============================================================
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { auction, bid, transaction, watchlist, notification, user } from "@/server/db/schema";
import { and, eq, desc, asc, ilike, gte, lte, or, ne, lt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import Pusher from "pusher";
 
const pusher = new Pusher({
  appId:   process.env.PUSHER_APP_ID!,
  key:     process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret:  process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS:  true,
});
 
const CATEGORY_VALUES = [
  "electronics","fashion","art","collectibles","vehicles",
  "real_estate","jewelry","books","sports","home_garden","toys","other",
] as const;
 
export const auctionRouter = createTRPCRouter({
 
  // ── Public browse ─────────────────────────────────────────
 
  list: publicProcedure
    .input(z.object({
      search:    z.string().optional(),
      category:  z.string().optional(),
      status:    z.enum(["active","ended","all"]).default("active"),
      minPrice:  z.number().optional(),
      maxPrice:  z.number().optional(),
      sortBy:    z.enum(["newest","ending_soon","price_asc","price_desc","most_bids"]).default("newest"),
      limit:     z.number().default(12),
      offset:    z.number().default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const filters = [eq(auction.status, input?.status === "ended" ? "ended" : input?.status === "all" ? "active" : "active")];
      if (input?.status === "all") filters.length = 0;
      if (input?.status === "active") filters[0] = eq(auction.status, "active");
      if (input?.status === "ended")  filters[0] = eq(auction.status, "ended");
 
      if (input?.category && input.category !== "all") {
        filters.push(eq(auction.category, input.category as any));
      }
      if (input?.search) {
        filters.push(or(
          ilike(auction.title, `%${input.search}%`),
          ilike(auction.description, `%${input.search}%`),
        )!);
      }
      if (input?.minPrice) filters.push(gte(auction.currentPrice, input.minPrice));
      if (input?.maxPrice) filters.push(lte(auction.currentPrice, input.maxPrice));
 
      const orderBy =
        input?.sortBy === "ending_soon"  ? asc(auction.endTime)          :
        input?.sortBy === "price_asc"    ? asc(auction.currentPrice)     :
        input?.sortBy === "price_desc"   ? desc(auction.currentPrice)    :
        input?.sortBy === "most_bids"    ? desc(auction.totalBids)       :
        desc(auction.createdAt);
 
      const auctions = await ctx.db.query.auction.findMany({
        where: and(...filters),
        with:  {
          seller: { columns: { id: true, name: true, image: true, rating: true } },
          bids:   { columns: { id: true }, orderBy: desc(bid.amount), limit: 1 },
        },
        orderBy,
        limit:  input?.limit  ?? 12,
        offset: input?.offset ?? 0,
      });
 
      // Attach watchlist status if logged in
      let watchedIds = new Set<string>();
      if (ctx.session?.user) {
        const wl = await ctx.db.query.watchlist.findMany({
          where: eq(watchlist.userId, ctx.session.user.id),
          columns: { auctionId: true },
        });
        watchedIds = new Set(wl.map(w => w.auctionId));
      }
 
      return auctions.map(a => ({ ...a, isWatched: watchedIds.has(a.id) }));
    }),
 
  // Featured auctions
  featured: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.auction.findMany({
      where: and(eq(auction.status, "active"), eq(auction.isFeatured, true)),
      with:  { seller: { columns: { id: true, name: true, image: true, rating: true } } },
      orderBy: asc(auction.endTime),
      limit: 6,
    });
  }),
 
  // Single auction detail
  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const a = await ctx.db.query.auction.findFirst({
        where: eq(auction.id, input.id),
        with: {
          seller: { columns: { id: true, name: true, image: true, rating: true, bio: true, totalSales: true } },
          bids: {
            with: { bidder: { columns: { id: true, name: true, image: true } } },
            orderBy: desc(bid.amount),
            limit: 20,
          },
          winner: { columns: { id: true, name: true, image: true } },
        },
      });
      if (!a) throw new TRPCError({ code: "NOT_FOUND" });
 
      // Increment view count
      await ctx.db.update(auction).set({ viewCount: a.viewCount + 1 }).where(eq(auction.id, a.id));
 
      let isWatched = false;
      if (ctx.session?.user) {
        const wl = await ctx.db.query.watchlist.findFirst({
          where: and(eq(watchlist.userId, ctx.session.user.id), eq(watchlist.auctionId, input.id)),
        });
        isWatched = !!wl;
      }
 
      return { ...a, isWatched };
    }),
 
  // ── Seller CRUD ───────────────────────────────────────────
 
  mySelling: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.auction.findMany({
      where: eq(auction.sellerId, ctx.session.user.id),
      with:  { bids: { columns: { id: true } } },
      orderBy: desc(auction.createdAt),
    });
  }),
 
  create: protectedProcedure
    .input(z.object({
      title:        z.string().min(5).max(200),
      description:  z.string().min(10),
      category:     z.enum(CATEGORY_VALUES),
      images:       z.array(z.string()).min(1).max(8),
      basePrice:    z.number().positive(),
      reservePrice: z.number().positive().optional(),
      buyNowPrice:  z.number().positive().optional(),
      endTime:      z.string(), // ISO string
      startNow:     z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbUser = await ctx.db.query.user.findFirst({
        where: eq(user.id, ctx.session.user.id),
        columns: { role: true, isSuspended: true },
      });
      if (dbUser?.role !== "seller" && dbUser?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only sellers can create auctions" });
      }
      if (dbUser.isSuspended) throw new TRPCError({ code: "FORBIDDEN", message: "Your account is suspended" });
 
      const [a] = await ctx.db.insert(auction).values({
        sellerId:     ctx.session.user.id,
        title:        input.title,
        description:  input.description,
        category:     input.category,
        images:       input.images,
        basePrice:    input.basePrice,
        currentPrice: input.basePrice,
        reservePrice: input.reservePrice,
        buyNowPrice:  input.buyNowPrice,
        status:       input.startNow ? "pending_approval" : "draft",
        endTime:      new Date(input.endTime),
        startTime:    input.startNow ? new Date() : undefined,
      }).returning();
      return a;
    }),
 
  update: protectedProcedure
    .input(z.object({
      id:           z.string().uuid(),
      title:        z.string().min(5).max(200).optional(),
      description:  z.string().min(10).optional(),
      category:     z.enum(CATEGORY_VALUES).optional(),
      images:       z.array(z.string()).optional(),
      reservePrice: z.number().positive().optional(),
      buyNowPrice:  z.number().positive().optional(),
      endTime:      z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.auction.findFirst({
        where: and(eq(auction.id, input.id), eq(auction.sellerId, ctx.session.user.id)),
      });
      if (!existing) throw new TRPCError({ code: "FORBIDDEN" });
      if (existing.status === "active" && existing.totalBids > 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot edit auction with active bids" });
      }
      const { id, ...data } = input;
      await ctx.db.update(auction)
        .set({ ...data, endTime: data.endTime ? new Date(data.endTime) : undefined, updatedAt: new Date() })
        .where(eq(auction.id, id));
    }),
 
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.auction.findFirst({
        where: and(eq(auction.id, input.id), eq(auction.sellerId, ctx.session.user.id)),
      });
      if (!existing) throw new TRPCError({ code: "FORBIDDEN" });
      if (existing.totalBids > 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot delete auction with bids" });
      await ctx.db.delete(auction).where(eq(auction.id, input.id));
    }),
 
  submitForApproval: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.auction.findFirst({
        where: and(eq(auction.id, input.id), eq(auction.sellerId, ctx.session.user.id)),
      });
      if (!existing) throw new TRPCError({ code: "FORBIDDEN" });
      await ctx.db.update(auction)
        .set({ status: "pending_approval", startTime: new Date(), updatedAt: new Date() })
        .where(eq(auction.id, input.id));
    }),
 
  relist: protectedProcedure
    .input(z.object({ id: z.string().uuid(), endTime: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.auction.findFirst({
        where: and(eq(auction.id, input.id), eq(auction.sellerId, ctx.session.user.id)),
      });
      if (!existing) throw new TRPCError({ code: "FORBIDDEN" });
      if (existing.status !== "ended") throw new TRPCError({ code: "BAD_REQUEST", message: "Can only relist ended auctions" });
      await ctx.db.update(auction)
        .set({
          status:       "pending_approval",
          currentPrice: existing.basePrice,
          totalBids:    0,
          winnerId:     null,
          endTime:      new Date(input.endTime),
          startTime:    new Date(),
          updatedAt:    new Date(),
        })
        .where(eq(auction.id, input.id));
    }),
 
  // ── Watchlist ────────────────────────────────────────────
 
  toggleWatchlist: protectedProcedure
    .input(z.object({ auctionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.watchlist.findFirst({
        where: and(eq(watchlist.userId, ctx.session.user.id), eq(watchlist.auctionId, input.auctionId)),
      });
      if (existing) {
        await ctx.db.delete(watchlist).where(eq(watchlist.id, existing.id));
        return { watching: false };
      }
      await ctx.db.insert(watchlist).values({ userId: ctx.session.user.id, auctionId: input.auctionId });
      return { watching: true };
    }),
 
  myWatchlist: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.watchlist.findMany({
      where: eq(watchlist.userId, ctx.session.user.id),
      with:  { auction: { with: { seller: { columns: { id: true, name: true, image: true } } } } },
      orderBy: desc(watchlist.createdAt),
    });
  }),
});
 