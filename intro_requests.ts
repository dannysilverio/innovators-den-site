import { pgTable, uuid, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";

/**
 * Intent types for intro requests — why the sender wants to connect.
 */
export const INTRO_INTENT_TYPES = [
  "collaborate",
  "hire",
  "invest",
  "advise",
  "speak",
  "partner",
  "other",
] as const;

export type IntroIntentType = (typeof INTRO_INTENT_TYPES)[number];

/**
 * Intro request status lifecycle:
 *   pending → accepted | declined | expired
 */
export const INTRO_STATUSES = ["pending", "accepted", "declined", "expired"] as const;
export type IntroStatus = (typeof INTRO_STATUSES)[number];

/**
 * Intro requests — request-to-connect model.
 * Sender proposes an introduction; recipient controls acceptance.
 * No message thread exists until accepted.
 */
export const introRequestsTable = pgTable(
  "intro_requests",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    senderUserId: uuid("sender_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    recipientUserId: uuid("recipient_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    intentType: text("intent_type").notNull(),
    note: text("note"),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (t) => ({
    senderIdx: index("intro_requests_sender_idx").on(t.senderUserId),
    recipientIdx: index("intro_requests_recipient_idx").on(t.recipientUserId),
    statusIdx: index("intro_requests_status_idx").on(t.status),
    // One pending intro per sender-recipient pair at a time
    uniquePendingPair: uniqueIndex("intro_requests_unique_pair").on(
      t.senderUserId,
      t.recipientUserId
    ),
  })
);

export type IntroRequest = typeof introRequestsTable.$inferSelect;

/**
 * Intro thread messages — only accessible after the request is accepted.
 * Intentionally simple: no attachments, no reactions, no threads.
 * Max message length enforced at API layer.
 */
export const introMessagesTable = pgTable(
  "intro_messages",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    introRequestId: uuid("intro_request_id")
      .notNull()
      .references(() => introRequestsTable.id, { onDelete: "cascade" }),
    senderUserId: uuid("sender_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    requestIdx: index("intro_messages_request_idx").on(t.introRequestId),
    senderIdx: index("intro_messages_sender_idx").on(t.senderUserId),
    createdIdx: index("intro_messages_created_idx").on(t.createdAt),
  })
);

export type IntroMessage = typeof introMessagesTable.$inferSelect;
