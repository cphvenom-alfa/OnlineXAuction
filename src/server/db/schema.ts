import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	pgTable,
	pgTableCreator,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `pg-drizzle_${name}`);

export const posts = createTable(
	"post",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 256 }),
		createdById: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => user.id),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("created_by_idx").on(t.createdById),
		index("name_idx").on(t.name),
	],
);
// src/server/db/schema.ts
import {
   integer, pgEnum,
  uuid, doublePrecision
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum      = pgEnum("user_role",      ["buyer", "seller", "admin"]);
export const auctionStatusEnum = pgEnum("auction_status", ["draft", "pending_approval", "active", "ended", "cancelled", "relisted"]);
export const categoryEnum      = pgEnum("category",       ["electronics", "fashion", "art", "collectibles", "vehicles", "real_estate", "jewelry", "books", "sports", "home_garden", "toys", "other"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "refunded", "disputed", "cancelled"]);
export const shipStatusEnum    = pgEnum("ship_status",    ["not_shipped", "shipped", "delivered"]);
export const reportStatusEnum  = pgEnum("report_status",  ["open", "resolved", "dismissed"]);

// ─── BetterAuth tables ────────────────────────────────────────────────────────

export const user = pgTable("user", {
  id:            text("id").primaryKey(),
  name:          text("name").notNull(),
  email:         text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image:         text("image"),
  createdAt:     timestamp("created_at").notNull(),
  updatedAt:     timestamp("updated_at").notNull(),
  // Extended
  role:          userRoleEnum("role").default("buyer").notNull(),
  phone:         text("phone"),
  address:       text("address"),
  bio:           text("bio"),
  isSuspended:   boolean("is_suspended").default(false).notNull(),
  isVerified:    boolean("is_verified").default(false).notNull(),
  // Seller stats
  totalSales:    integer("total_sales").default(0).notNull(),
  rating:        doublePrecision("rating").default(0).notNull(),
});

export const session = pgTable("session", {
  id:          text("id").primaryKey(),
  expiresAt:   timestamp("expires_at").notNull(),
  token:       text("token").notNull().unique(),
  createdAt:   timestamp("created_at").notNull(),
  updatedAt:   timestamp("updated_at").notNull(),
  ipAddress:   text("ip_address"),
  userAgent:   text("user_agent"),
  userId:      text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id:                    text("id").primaryKey(),
  accountId:             text("account_id").notNull(),
  providerId:            text("provider_id").notNull(),
  userId:                text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken:           text("access_token"),
  refreshToken:          text("refresh_token"),
  idToken:               text("id_token"),
  accessTokenExpiresAt:  timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope:                 text("scope"),
  password:              text("password"),
  createdAt:             timestamp("created_at").notNull(),
  updatedAt:             timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id:         text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value:      text("value").notNull(),
  expiresAt:  timestamp("expires_at").notNull(),
  createdAt:  timestamp("created_at"),
  updatedAt:  timestamp("updated_at"),
});

// ─── Auctions ─────────────────────────────────────────────────────────────────

export const auction = pgTable("auction", {
  id:           uuid("id").primaryKey().defaultRandom(),
  sellerId:     text("seller_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title:        text("title").notNull(),
  description:  text("description").notNull(),
  category:     categoryEnum("category").notNull(),
  images:       text("images").array().notNull().default([]),
  basePrice:    doublePrecision("base_price").notNull(),
  currentPrice: doublePrecision("current_price").notNull(),
  reservePrice: doublePrecision("reserve_price"),
  buyNowPrice:  doublePrecision("buy_now_price"),
  status:       auctionStatusEnum("status").default("draft").notNull(),
  startTime:    timestamp("start_time"),
  endTime:      timestamp("end_time"),
  winnerId:     text("winner_id").references(() => user.id, { onDelete: "set null" }),
  totalBids:    integer("total_bids").default(0).notNull(),
  viewCount:    integer("view_count").default(0).notNull(),
  isFeatured:   boolean("is_featured").default(false).notNull(),
  adminNote:    text("admin_note"),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
  updatedAt:    timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("auction_status_idx").on(t.status),
  index("auction_seller_idx").on(t.sellerId),
  index("auction_category_idx").on(t.category),
]);

// ─── Bids ─────────────────────────────────────────────────────────────────────

export const bid = pgTable("bid", {
  id:        uuid("id").primaryKey().defaultRandom(),
  auctionId: uuid("auction_id").notNull().references(() => auction.id, { onDelete: "cascade" }),
  bidderId:  text("bidder_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  amount:    doublePrecision("amount").notNull(),
  isWinning: boolean("is_winning").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("bid_auction_idx").on(t.auctionId),
  index("bid_bidder_idx").on(t.bidderId),
]);

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transaction = pgTable("transaction", {
  id:            uuid("id").primaryKey().defaultRandom(),
  auctionId:     uuid("auction_id").notNull().references(() => auction.id, { onDelete: "cascade" }),
  buyerId:       text("buyer_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  sellerId:      text("seller_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  amount:        doublePrecision("amount").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("pending").notNull(),
  shipStatus:    shipStatusEnum("ship_status").default("not_shipped").notNull(),
  invoiceNumber: text("invoice_number"),
  paidAt:        timestamp("paid_at"),
  shippedAt:     timestamp("shipped_at"),
  deliveredAt:   timestamp("delivered_at"),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
  updatedAt:     timestamp("updated_at").defaultNow().notNull(),
});

// ─── Watchlist ────────────────────────────────────────────────────────────────

export const watchlist = pgTable("watchlist", {
  id:        uuid("id").primaryKey().defaultRandom(),
  userId:    text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  auctionId: uuid("auction_id").notNull().references(() => auction.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Notifications ────────────────────────────────────────────────────────────

export const notification = pgTable("notification", {
  id:        uuid("id").primaryKey().defaultRandom(),
  userId:    text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title:     text("title").notNull(),
  body:      text("body").notNull(),
  type:      text("type").notNull(), // outbid | won | auction_ended | payment | shipped | new_bid
  auctionId: uuid("auction_id").references(() => auction.id, { onDelete: "cascade" }),
  isRead:    boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Reports / Disputes ───────────────────────────────────────────────────────

export const report = pgTable("report", {
  id:         uuid("id").primaryKey().defaultRandom(),
  reporterId: text("reporter_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  targetId:   text("target_id"),       // user or auction id
  targetType: text("target_type"),     // "user" | "auction"
  reason:     text("reason").notNull(),
  details:    text("details"),
  status:     reportStatusEnum("status").default("open").notNull(),
  adminNote:  text("admin_note"),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
  updatedAt:  timestamp("updated_at").defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
  auctions:      many(auction, { relationName: "seller"  }),
  wonAuctions:   many(auction, { relationName: "winner"  }),
  bids:          many(bid),
  buyTransactions:  many(transaction, { relationName: "buyer"  }),
  sellTransactions: many(transaction, { relationName: "seller" }),
  watchlist:     many(watchlist),
  notifications: many(notification),
}));

export const auctionRelations = relations(auction, ({ one, many }) => ({
  seller:      one(user,        { fields: [auction.sellerId],  references: [user.id], relationName: "seller" }),
  winner:      one(user,        { fields: [auction.winnerId],  references: [user.id], relationName: "winner" }),
  bids:        many(bid),
  transaction: one(transaction, { fields: [auction.id], references: [transaction.auctionId] }),
  watchedBy:   many(watchlist),
}));

export const bidRelations = relations(bid, ({ one }) => ({
  auction: one(auction, { fields: [bid.auctionId], references: [auction.id] }),
  bidder:  one(user,    { fields: [bid.bidderId],  references: [user.id]    }),
}));

export const transactionRelations = relations(transaction, ({ one }) => ({
  auction: one(auction, { fields: [transaction.auctionId], references: [auction.id] }),
  buyer:   one(user,    { fields: [transaction.buyerId],   references: [user.id], relationName: "buyer"  }),
  seller:  one(user,    { fields: [transaction.sellerId],  references: [user.id], relationName: "seller" }),
}));

export const watchlistRelations = relations(watchlist, ({ one }) => ({
  user:    one(user,    { fields: [watchlist.userId],    references: [user.id]    }),
  auction: one(auction, { fields: [watchlist.auctionId], references: [auction.id] }),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
  user:    one(user,    { fields: [notification.userId],    references: [user.id]    }),
  auction: one(auction, { fields: [notification.auctionId], references: [auction.id] }),
}));

export const reportRelations = relations(report, ({ one }) => ({
  reporter: one(user, { fields: [report.reporterId], references: [user.id] }),
}));