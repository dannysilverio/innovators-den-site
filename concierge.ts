import { pgTable, uuid, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";

/**
 * Concierge request types — what kind of white-glove help is needed.
 * Available to Pro and Founding members.
 */
export const CONCIERGE_REQUEST_TYPES = [
  "intro",          // Warm intro to a specific person or type
  "event",          // Logistics, venue, speaker, or planning support
  "sourcing",       // Finding a vendor, resource, service, or talent
  "strategy",       // Strategic guidance or sounding board
  "opportunity",    // Custom curated opportunity pipeline
  "press",          // Media or press relations assistance
  "other",          // General concierge support
] as const;

export type ConciergeRequestType = (typeof CONCIERGE_REQUEST_TYPES)[number];

export const CONCIERGE_STATUSES = [
  "pending",       // Submitted, awaiting assignment
  "assigned",      // Assigned to a team member
  "in_progress",   // Actively being worked on
  "resolved",      // Completed / delivered
  "closed",        // Closed without resolution (e.g. member retracted)
] as const;

export type ConciergeStatus = (typeof CONCIERGE_STATUSES)[number];

export const conciergeRequestsTable = pgTable(
  "concierge_requests",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    /** Subscription tier at the time of submission. */
    memberTier: text("member_tier").notNull().default("pro"),
    requestType: text("request_type").notNull().default("other"),
    subject: text("subject").notNull(),
    description: text("description").notNull(),
    status: text("status").notNull().default("pending"),
    /** Priority signal (set by platform team, not member). */
    priority: text("priority").notNull().default("normal"),
    /** Platform team member assigned to handle this. */
    assignedToUserId: uuid("assigned_to_user_id"),
    /** Internal notes from the platform team (not shown to member). */
    teamNotes: text("team_notes"),
    /** Response or update visible to the member. */
    memberUpdate: text("member_update"),
    isUrgent: boolean("is_urgent").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => ({
    userIdx: index("concierge_user_idx").on(t.userId),
    statusIdx: index("concierge_status_idx").on(t.status),
    typeIdx: index("concierge_type_idx").on(t.requestType),
  })
);

export type ConciergeRequest = typeof conciergeRequestsTable.$inferSelect;
