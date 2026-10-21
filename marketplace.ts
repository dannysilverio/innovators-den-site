import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";

/**
 * Service categories in the Den Marketplace.
 * Members can list services they offer to the community.
 */
export const MARKETPLACE_CATEGORIES = [
  "consulting",   // Strategy, business consulting, advisory
  "design",       // UI/UX, brand, visual design
  "development",  // Engineering, software, web dev
  "coaching",     // Executive, career, life coaching
  "workshops",    // Workshops, training, courses
  "speaking",     // Keynotes, panels, conferences
  "creative",     // Content, photography, video, writing
  "legal",        // Legal advice, contracts, IP
  "finance",      // Accounting, fundraising prep, CFO services
  "marketing",    // Growth, PR, social media, ads
  "other",        // General
] as const;

export type MarketplaceCategory = (typeof MARKETPLACE_CATEGORIES)[number];

export const RATE_UNITS = ["per_hour", "per_day", "per_project", "per_month", "custom"] as const;
export type RateUnit = (typeof RATE_UNITS)[number];

export const LISTING_STATUSES = ["active", "paused", "draft"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const INQUIRY_STATUSES = ["pending", "replied", "closed"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const marketplaceListingsTable = pgTable(
  "marketplace_listings",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: text("category").notNull().default("other"),
    description: text("description").notNull(),
    /** Rate amount as text — allows "$500", "Starting at $2,000", etc. */
    rate: text("rate"),
    rateUnit: text("rate_unit").notNull().default("per_project"),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    imageUrl: text("image_url"),
    /** Link for more info or booking. */
    bookingUrl: text("booking_url"),
    status: text("status").notNull().default("draft"),
    /** Whether to show this listing in the public marketplace. */
    isPublic: boolean("is_public").notNull().default(true),
    /** Featured listings appear at the top of browse. Set by platform. */
    isFeatured: boolean("is_featured").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("marketplace_user_idx").on(t.userId),
    categoryIdx: index("marketplace_category_idx").on(t.category),
    statusIdx: index("marketplace_status_idx").on(t.status),
    featuredIdx: index("marketplace_featured_idx").on(t.isFeatured),
  })
);

export type MarketplaceListing = typeof marketplaceListingsTable.$inferSelect;

export const marketplaceInquiriesTable = pgTable(
  "marketplace_inquiries",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => marketplaceListingsTable.id, { onDelete: "cascade" }),
    inquirerUserId: uuid("inquirer_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    status: text("status").notNull().default("pending"),
    /** Reply from the listing owner. */
    ownerReply: text("owner_reply"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    repliedAt: timestamp("replied_at", { withTimezone: true }),
  },
  (t) => ({
    listingIdx: index("marketplace_inquiry_listing_idx").on(t.listingId),
    inquirerIdx: index("marketplace_inquiry_inquirer_idx").on(t.inquirerUserId),
  })
);

export type MarketplaceInquiry = typeof marketplaceInquiriesTable.$inferSelect;
