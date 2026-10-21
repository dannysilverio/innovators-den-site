import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const bookmarksTable = pgTable("bookmarks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: text("device_id").notNull(),
  articleId: text("article_id").notNull(),
  articleTitle: text("article_title").notNull(),
  articleSummary: text("article_summary").notNull().default(""),
  articleSourceName: text("article_source_name").notNull().default(""),
  articleImageUrl: text("article_image_url"),
  articleTopic: text("article_topic").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Bookmark = typeof bookmarksTable.$inferSelect;
export type InsertBookmark = typeof bookmarksTable.$inferInsert;
