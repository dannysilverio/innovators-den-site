import { pgTable, uuid, text, boolean, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";

/**
 * Intelligence report types — curated B2B data products for brands and employers.
 */
export const INTELLIGENCE_REPORT_TYPES = [
  "trend",         // Community trend analysis
  "talent",        // Talent landscape signals
  "opportunity",   // Opportunity gap analysis
  "brand",         // Brand perception and engagement signals
  "ecosystem",     // Ecosystem health report
  "custom",        // Custom report for a specific partner
] as const;

export type IntelligenceReportType = (typeof INTELLIGENCE_REPORT_TYPES)[number];

/**
 * Intelligence reports — curated data products published by the platform team.
 * Gated behind founding or partner tier.
 */
export const intelligenceReportsTable = pgTable(
  "intelligence_reports",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    type: text("type").notNull().default("trend"),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    /** Report body content (markdown). */
    content: text("content"),
    /** Structured data payload — charts, metrics, signals. */
    data: jsonb("data").notNull().default({}),
    /** Minimum subscription tier required to access full content. */
    requiredTier: text("required_tier").notNull().default("founding"),
    /** Whether this report is publicly listed (summary visible to all). */
    isPublic: boolean("is_public").notNull().default(true),
    /** Period this report covers (e.g. "Q1 2026", "March 2026"). */
    period: text("period"),
    authorUserId: uuid("author_user_id").references(() => usersTable.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    typeIdx: index("intelligence_type_idx").on(t.type),
    publicIdx: index("intelligence_public_idx").on(t.isPublic),
    publishedIdx: index("intelligence_published_idx").on(t.publishedAt),
  })
);

export type IntelligenceReport = typeof intelligenceReportsTable.$inferSelect;
