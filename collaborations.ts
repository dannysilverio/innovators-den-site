import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const COLLAB_TYPES = [
  "co-founder",
  "advisor",
  "contractor",
  "beta-tester",
  "investor",
  "mentor",
] as const;

export type CollabType = (typeof COLLAB_TYPES)[number];

export const COLLAB_STATUSES = ["active", "filled", "expired"] as const;
export type CollabStatus = (typeof COLLAB_STATUSES)[number];

export const collaborationsTable = pgTable(
  "collaborations",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id").notNull(),
    displayName: text("display_name").notNull(),
    type: text("type").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    skills: text("skills").array().default(sql`'{}'::text[]`),
    equity: text("equity"),
    contactMethod: text("contact_method"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("collaborations_user_idx").on(t.userId),
    typeIdx: index("collaborations_type_idx").on(t.type),
    statusIdx: index("collaborations_status_idx").on(t.status),
    createdIdx: index("collaborations_created_idx").on(t.createdAt),
  })
);

export type Collaboration = typeof collaborationsTable.$inferSelect;
