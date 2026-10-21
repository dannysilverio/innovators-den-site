import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";

/**
 * auth_identities — stores one row per authentication method per user.
 * provider: 'email' | 'google' | 'apple'
 * provider_id: email address (for email), Google sub, Apple sub
 * password_hash: only populated for provider='email'
 */
export const authIdentitiesTable = pgTable("auth_identities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  providerId: text("provider_id").notNull(),
  passwordHash: text("password_hash"),
  /** Secure random token for email-based password reset (expires in 1 hour) */
  resetToken: text("reset_token"),
  resetTokenExpiresAt: timestamp("reset_token_expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AuthIdentity = typeof authIdentitiesTable.$inferSelect;
