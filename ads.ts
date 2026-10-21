import { pgTable, uuid, text, boolean, jsonb, timestamp, integer, index, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";

/**
 * Ad inventory slots — the full slot registry for web + app.
 * Each slot maps to a specific page/screen position and format.
 * Seeded with 27 canonical slots matching the inventory spec.
 */
export const adInventorySlotsTable = pgTable(
  "ad_inventory_slots",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    /** GAM-compatible slot identifier e.g. "W-HOME-001", "A-DOORS-001" */
    slotKey: text("slot_key").notNull().unique(),
    /** GAM-style path e.g. "web/home/hero_billboard" */
    gamPath: text("gam_path"),
    name: text("name").notNull(),
    /** web | app | both */
    platform: text("platform").notNull().default("both"),
    pageOrScreen: text("page_or_screen").notNull(),
    /** above_fold | in_feed | right_rail | bottom_anchor | interstitial | rewarded */
    placementType: text("placement_type").notNull(),
    /** display_billboard | native_card | display_rectangle | display_rail | adhesive_banner | interstitial | rewarded | featured_listing | house_ad | sponsored_module */
    formatType: text("format_type").notNull(),
    /** sponsorship | native | display | featured_listing | interstitial | rewarded | house_ad */
    productType: text("product_type").notNull(),
    /** high | medium | low */
    priority: text("priority").notNull().default("medium"),
    active: boolean("active").notNull().default(true),
    description: text("description"),
    /** { excludeTiers: ["founding"] } — tiers that should not see this slot's ads */
    membershipVisibility: jsonb("membership_visibility").notNull().default({}),
    /** Future: { cities: [], topics: [] } */
    targeting: jsonb("targeting").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    platformIdx: index("ad_slot_platform_idx").on(t.platform),
    pageIdx: index("ad_slot_page_idx").on(t.pageOrScreen),
    activeIdx: index("ad_slot_active_idx").on(t.active),
  })
);

export type AdInventorySlot = typeof adInventorySlotsTable.$inferSelect;

/**
 * Ad campaigns — an advertiser's campaign with flight dates and budget metadata.
 */
export const adCampaignsTable = pgTable(
  "ad_campaigns",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    advertiserName: text("advertiser_name").notNull(),
    campaignName: text("campaign_name").notNull(),
    /** direct | sponsorship | native | house_ad | programmatic */
    campaignType: text("campaign_type").notNull().default("direct"),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    /** draft | active | paused | ended | cancelled */
    status: text("status").notNull().default("draft"),
    targetUrl: text("target_url"),
    targeting: jsonb("targeting").notNull().default({}),
    /** Booked value in cents */
    bookedValue: integer("booked_value"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index("ad_campaign_status_idx").on(t.status),
  })
);

export type AdCampaign = typeof adCampaignsTable.$inferSelect;

/**
 * Ad creatives — the actual visual/copy assets for a campaign.
 * One campaign can have multiple creatives (A/B or format variants).
 */
export const adCreativesTable = pgTable(
  "ad_creatives",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => adCampaignsTable.id, { onDelete: "cascade" }),
    /** billboard | native | featured_listing | interstitial | house_ad | sponsored_module */
    creativeType: text("creative_type").notNull(),
    headline: text("headline").notNull(),
    body: text("body"),
    imageUrl: text("image_url"),
    logoUrl: text("logo_url"),
    /** Short brand/org name for logo display */
    brandName: text("brand_name"),
    /** Short category label e.g. "FINANCE", "TECH", "LIFESTYLE" */
    category: text("category"),
    /** Short character(s) for logo fallback e.g. "AMEX", "G", "in" */
    logoChar: text("logo_char"),
    cta: text("cta").notNull().default("Learn More"),
    /** e.g. "Presented by Nike" or "SPONSORED" */
    sponsorLabel: text("sponsor_label"),
    /** Hex color for accent elements */
    accentColor: text("accent_color").default("#FFE600"),
    /** dark | light */
    theme: text("theme").notNull().default("dark"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    campaignIdx: index("ad_creative_campaign_idx").on(t.campaignId),
  })
);

export type AdCreative = typeof adCreativesTable.$inferSelect;

/**
 * Ad placements — maps a creative to a slot with delivery rules.
 * Multiple placements can target the same slot; weight determines priority.
 */
export const adPlacementsTable = pgTable(
  "ad_placements",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => adCampaignsTable.id, { onDelete: "cascade" }),
    slotId: uuid("slot_id")
      .notNull()
      .references(() => adInventorySlotsTable.id, { onDelete: "cascade" }),
    creativeId: uuid("creative_id")
      .notNull()
      .references(() => adCreativesTable.id, { onDelete: "cascade" }),
    /** Higher weight = served first when multiple placements compete */
    weight: integer("weight").notNull().default(1),
    /** Membership tiers that should NOT see this placement e.g. ["pro","founding"] */
    tierExclusions: jsonb("tier_exclusions").notNull().default([]),
    pageTargeting: jsonb("page_targeting").notNull().default([]),
    cityTargeting: jsonb("city_targeting").notNull().default([]),
    topicTargeting: jsonb("topic_targeting").notNull().default([]),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slotIdx: index("ad_placement_slot_idx").on(t.slotId),
    campaignIdx: index("ad_placement_campaign_idx").on(t.campaignId),
    activeIdx: index("ad_placement_active_idx").on(t.active),
  })
);

export type AdPlacement = typeof adPlacementsTable.$inferSelect;

/**
 * Ad impressions — one row per view event. Kept lightweight.
 * Designed for future aggregation into materialized summaries.
 */
export const adImpressionsTable = pgTable(
  "ad_impressions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    placementId: uuid("placement_id").references(() => adPlacementsTable.id, { onDelete: "set null" }),
    campaignId: uuid("campaign_id").references(() => adCampaignsTable.id, { onDelete: "set null" }),
    slotKey: text("slot_key").notNull(),
    /** web | app */
    platform: text("platform"),
    pageOrScreen: text("page_or_screen"),
    membershipTier: text("membership_tier").default("free"),
    userId: uuid("user_id").references(() => usersTable.id, { onDelete: "set null" }),
    isHouseAd: boolean("is_house_ad").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slotKeyIdx: index("ad_impression_slot_idx").on(t.slotKey),
    campaignIdx: index("ad_impression_campaign_idx").on(t.campaignId),
    createdIdx: index("ad_impression_created_idx").on(t.createdAt),
  })
);

export type AdImpression = typeof adImpressionsTable.$inferSelect;

/**
 * Ad clicks — one row per click event.
 */
export const adClicksTable = pgTable(
  "ad_clicks",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    placementId: uuid("placement_id").references(() => adPlacementsTable.id, { onDelete: "set null" }),
    campaignId: uuid("campaign_id").references(() => adCampaignsTable.id, { onDelete: "set null" }),
    slotKey: text("slot_key").notNull(),
    platform: text("platform"),
    pageOrScreen: text("page_or_screen"),
    membershipTier: text("membership_tier").default("free"),
    userId: uuid("user_id").references(() => usersTable.id, { onDelete: "set null" }),
    isHouseAd: boolean("is_house_ad").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slotKeyIdx: index("ad_click_slot_idx").on(t.slotKey),
    campaignIdx: index("ad_click_campaign_idx").on(t.campaignId),
  })
);

export type AdClick = typeof adClicksTable.$inferSelect;
