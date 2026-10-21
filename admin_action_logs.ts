import { pgTable, uuid, text, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";

/**
 * Immutable audit log of admin/editor actions.
 * Written at the moment of the action — never mutated.
 */
export const adminActionLogsTable = pgTable(
  "admin_action_logs",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    adminUserId: uuid("admin_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    actionType: text("action_type").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),

    notes: text("notes"),
    meta: jsonb("meta").default({}),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    adminIdx: index("admin_action_logs_admin_idx").on(t.adminUserId),
    targetIdx: index("admin_action_logs_target_idx").on(t.targetType, t.targetId),
    actionIdx: index("admin_action_logs_action_idx").on(t.actionType),
    createdIdx: index("admin_action_logs_created_idx").on(t.createdAt),
  })
);

export type AdminActionLog = typeof adminActionLogsTable.$inferSelect;
