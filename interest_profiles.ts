import { pgTable, uuid, text, real, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";

/**
 * Persistent per-topic affinity scores for each user.
 * Scores are updated on every interaction and decay over time.
 *
 * Score range: 0.0 (no interest) – 1.0 (strong interest)
 * Half-life:   14 days (scores decay to ~50% if no interactions in 14 days)
 *
 * Interaction weights applied to score:
 *   view:  +0.10
 *   save:  +0.30
 *   share: +0.40
 *   skip:  -0.15
 */
export const userInterestProfilesTable = pgTable(
  "user_interest_profiles",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    topic: text("topic").notNull(),
    score: real("score").notNull().default(0),
    interactionCount: integer("interaction_count").notNull().default(0),
    lastInteractedAt: timestamp("last_interacted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique("user_topic_unique").on(table.userId, table.topic)]
);

export type UserInterestProfile = typeof userInterestProfilesTable.$inferSelect;
