import { pgTable, text, uuid, boolean, integer, real, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const articlesTable = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  content: text("content"),
  videoUrl: text("video_url"),
  videoPosterUrl: text("video_poster_url"),
  videoCaption: text("video_caption"),
  sourceName: text("source_name").notNull(),
  sourceUrl: text("source_url").notNull(),
  imageUrl: text("image_url"),
  topic: text("topic").notNull(),
  status: text("status").notNull().default("pending"),
  aiScore: integer("ai_score"),
  isSponsored: boolean("is_sponsored").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  tags: text("tags").array().default(sql`'{}'::text[]`),
  entities: text("entities").array().default(sql`'{}'::text[]`),
  editorialQualityScore: real("editorial_quality_score").default(0.5),
  noveltyScore: real("novelty_score").default(0),
  trendScore: real("trend_score").default(0),
  publishAt: timestamp("publish_at", { withTimezone: true }),
  reviewNote: text("review_note"),
  // Creator-submitted content fields
  isCreatorContent: boolean("is_creator_content").notNull().default(false),
  submittedByUserId: uuid("submitted_by_user_id"),
  submittedByName: text("submitted_by_name"),
});

export const insertArticleSchema = createInsertSchema(articlesTable).omit({ id: true, createdAt: true });
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articlesTable.$inferSelect;
