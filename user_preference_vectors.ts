import { pgTable, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/**
 * One row per user. Updated incrementally after each event.
 * All score maps are JSONB objects keyed by topic/tag/source/entity name
 * with numeric values in the range [-10, +50] (unbounded positive but
 * normalised to 0-1 at query time by dividing by the max score in the map).
 *
 * verticalScores: { "Innovation": 12.4, "Culture": 3.1, … }
 * tagScores:      { "AI": 8.0, "Fintech": 2.5, … }
 * sourceScores:   { "TechCrunch": 5.0, … }
 * entityScores:   { "OpenAI": 3.0, … }
 * formatScores:   { "briefing": 2.0, "long-form": 6.0 }
 */
export const userPreferenceVectorsTable = pgTable("user_preference_vectors", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  verticalScores: jsonb("vertical_scores").notNull().default({}),
  tagScores: jsonb("tag_scores").notNull().default({}),
  sourceScores: jsonb("source_scores").notNull().default({}),
  entityScores: jsonb("entity_scores").notNull().default({}),
  formatScores: jsonb("format_scores").notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserPreferenceVector = typeof userPreferenceVectorsTable.$inferSelect;
