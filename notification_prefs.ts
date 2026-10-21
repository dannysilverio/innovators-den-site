import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";

/**
 * Per-topic notification opt-ins.
 * One row per (user, topic) pair.
 * No push infrastructure yet — this is the preference model + trigger scaffold.
 */
export const userNotificationPrefsTable = pgTable("user_notification_prefs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  topic: text("topic").notNull(),
  notifyStories: boolean("notify_stories").notNull().default(false),
  notifyOpportunities: boolean("notify_opportunities").notNull().default(false),
  notifyEvents: boolean("notify_events").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserNotificationPref = typeof userNotificationPrefsTable.$inferSelect;
export type InsertUserNotificationPref = typeof userNotificationPrefsTable.$inferInsert;
