import { pgTable, uuid, text, timestamp, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Follows table — tracks when a user follows an innovator or topic.
 * targetType: 'innovator' | 'topic'
 * targetId:   innovator UUID or topic slug (e.g. 'Tech', 'Health')
 */
export const followsTable = pgTable("follows", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniqUserTarget: unique("follows_user_target_uniq").on(t.userId, t.targetType, t.targetId),
}));

export type Follow = typeof followsTable.$inferSelect;
