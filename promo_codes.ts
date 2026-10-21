import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const promoCodesTable = pgTable("promo_codes", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  type: text("type").notNull(),
  description: text("description"),
  usesAllowed: integer("uses_allowed"),
  usesRemaining: integer("uses_remaining"),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const promoCodeRedemptionsTable = pgTable("promo_code_redemptions", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  promoCodeId: text("promo_code_id").notNull().references(() => promoCodesTable.id),
  userId: text("user_id").notNull(),
  redeemedAt: timestamp("redeemed_at", { withTimezone: true }).notNull().defaultNow(),
});
