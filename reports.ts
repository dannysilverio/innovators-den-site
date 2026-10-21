import { pgTable, uuid, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";

/**
 * Abuse reasons taxonomy — used as the reason field on reports.
 * Keep values stable; add new ones rather than rename.
 */
export const REPORT_REASONS = [
  "spam",
  "misleading",
  "scam",
  "inappropriate",
  "impersonation",
  "off_topic",
  "other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

/**
 * Target types that can be reported.
 */
export const REPORT_TARGET_TYPES = [
  "article",
  "innovator",
  "opportunity",
  "event",
] as const;

export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export const reportsTable = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    reporterUserId: uuid("reporter_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),

    reason: text("reason").notNull(),
    details: text("details"),

    status: text("status").notNull().default("pending"),

    reviewedByUserId: uuid("reviewed_by_user_id"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewNotes: text("review_notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index("reports_status_idx").on(t.status),
    targetIdx: index("reports_target_idx").on(t.targetType, t.targetId),
    reporterIdx: index("reports_reporter_idx").on(t.reporterUserId),
    uniqueReport: uniqueIndex("reports_unique_per_user").on(
      t.reporterUserId,
      t.targetType,
      t.targetId,
      t.reason
    ),
  })
);

export type Report = typeof reportsTable.$inferSelect;
