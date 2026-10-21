import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const creatorCodesTable = pgTable("creator_codes", {
  id: serial("id").primaryKey(),
  code:               text("code").notNull().unique(),
  label:              text("label"),
  createdAt:          timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  redeemedAt:         timestamp("redeemed_at", { withTimezone: true }),
  redeemedByUserId:   text("redeemed_by_user_id"),
});

export type CreatorCode = typeof creatorCodesTable.$inferSelect;
