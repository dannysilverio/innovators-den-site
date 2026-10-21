import { pgTable, text, uuid, boolean, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventsTable = pgTable("events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  location: text("location").notNull(),
  address: text("address"),
  city: text("city"),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  eventEndDate: timestamp("event_end_date", { withTimezone: true }),
  type: text("type").notNull().default("in-person"),
  category: text("category").notNull().default("Innovation"),
  rsvpUrl: text("rsvp_url"),
  price: text("price").notNull().default("Free"),
  isPremium: boolean("is_premium").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  status: text("status").notNull().default("published"),
  organizer: text("organizer"),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;

/** Persistent attendee list — one row per (event, device) */
export const eventRsvpsTable = pgTable("event_rsvps", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: uuid("event_id").notNull().references(() => eventsTable.id, { onDelete: "cascade" }),
  userId: text("user_id"),                   // nullable — guest users may not have an account
  deviceId: text("device_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniqRsvp: unique("event_rsvps_event_device_uniq").on(t.eventId, t.deviceId),
}));
