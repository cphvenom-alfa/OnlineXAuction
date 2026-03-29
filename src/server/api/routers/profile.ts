
// ============================================================
// src/server/api/routers/profile.ts
// ============================================================
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { user, report } from "@/server/db/schema";
import { eq } from "drizzle-orm";
 
export const profileRouter = createTRPCRouter({
 
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.user.findFirst({ where: eq(user.id, ctx.session.user.id) });
  }),
 
  byId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.user.findFirst({
        where: eq(user.id, input.userId),
        columns: { id: true, name: true, image: true, bio: true, rating: true, totalSales: true, createdAt: true, role: true },
      });
    }),
 
  update: protectedProcedure
    .input(z.object({
      name:    z.string().min(1).max(100).optional(),
      phone:   z.string().max(20).optional(),
      address: z.string().max(500).optional(),
      bio:     z.string().max(500).optional(),
      image:   z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(user)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(user.id, ctx.session.user.id));
    }),
 
  submitReport: protectedProcedure
    .input(z.object({
      targetId:   z.string(),
      targetType: z.enum(["user","auction"]),
      reason:     z.string().min(5),
      details:    z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(report).values({
        reporterId: ctx.session.user.id,
        ...input,
      });
    }),
});
 