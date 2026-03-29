import { postRouter } from "@/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */


// export type definition of API

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */


import { auctionRouter }      from "./routers/auction";
import { bidRouter }          from "./routers/bid";
import { transactionRouter }  from "./routers/transaction";
import { adminRouter }        from "./routers/admin";
import { notificationRouter } from "./routers/notification";
import { profileRouter }      from "./routers/profile";
 
export const appRouter = createTRPCRouter({
  auction:      auctionRouter,
  bid:          bidRouter,
  transaction:  transactionRouter,
  admin:        adminRouter,
  notification: notificationRouter,
  profile:      profileRouter,
});
 
export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);