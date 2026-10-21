import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * In-app notification inbox.
 * type: 'follow' | 'opportunity' | 'signal' | 'room' | 'system'
 */
export const inboxNotificationsTable = pgTable("inbox_notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  type: text("type").notNull().default("system"),
  title: text("title").notNull(),
  body: text("body"),
  imageUrl: text("image_url"),
  actionUrl: text("action_url"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type InboxNotification = typeof inboxNotificationsTable.$inferSelect;
