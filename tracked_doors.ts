import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const trackedDoorsTable = pgTable("tracked_doors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: text("device_id").notNull(),
  doorId: text("door_id").notNull(),
  title: text("title").notNull(),
  organization: text("organization").notNull().default(""),
  doorType: text("door_type").notNull().default(""),
  status: text("status").notNull().default("saved"),
  trackedAt: timestamp("tracked_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type TrackedDoorRow = typeof trackedDoorsTable.$inferSelect;
export type InsertTrackedDoor = typeof trackedDoorsTable.$inferInsert;
