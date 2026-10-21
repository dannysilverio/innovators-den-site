import { pgTable, uuid, text, real, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";
import { articlesTable } from "./articles";

/**
 * Rich behavioral event log. Every meaningful user action produces a row here.
 * This is the raw signal source for the preference vector update pipeline.
 *
 * event_type values:
 *   impression | click | save | unsave | hide | share
 *   complete_read | less_like_this | more_like_this
 *   rsvp | apply_click | upgrade_click
 */
export const userEventsTable = pgTable("user_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  articleId: uuid("article_id").references(() => articlesTable.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  eventValue: real("event_value").default(1),
  dwellSeconds: integer("dwell_seconds"),
  scrollDepth: real("scroll_depth"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserEvent = typeof userEventsTable.$inferSelect;
