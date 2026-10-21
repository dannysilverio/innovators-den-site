import { pgTable, uuid, text, boolean, integer, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";

/**
 * circle_posts — persistent chat messages inside a circle room.
 * message_type: 'message' (default) | 'question' | 'answer'
 * parent_id: for answers — references the parent question post
 * Messages are NEVER deleted — permanent record of all conversations.
 */
export const circlePostsTable = pgTable(
  "circle_posts",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    circleId: uuid("circle_id")
      .notNull()
      .references(() => circlesTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    messageType: text("message_type").notNull().default("message"),
    parentId: uuid("parent_id"),
    isPinned: boolean("is_pinned").notNull().default(false),
    likeCount: integer("like_count").notNull().default(0),
    replyCount: integer("reply_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    circleIdx: index("circle_posts_circle_idx").on(t.circleId, t.createdAt),
    userIdx: index("circle_posts_user_idx").on(t.userId),
    parentIdx: index("circle_posts_parent_idx").on(t.parentId),
  })
);

export type CirclePost = typeof circlePostsTable.$inferSelect;

/**
 * circle_video_sessions — tracks live video room sessions per circle.
 * Uses Jitsi Meet (room_name → meet.jit.si/InnovatorsDen-{room_name}).
 * One active session per circle at a time.
 */
export const circleVideoSessionsTable = pgTable(
  "circle_video_sessions",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    circleId: uuid("circle_id")
      .notNull()
      .references(() => circlesTable.id, { onDelete: "cascade" }),
    startedBy: uuid("started_by")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    roomName: text("room_name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    participantCount: integer("participant_count").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
  },
  (t) => ({
    circleActiveIdx: index("cvs_circle_active_idx").on(t.circleId, t.isActive),
  })
);

export type CircleVideoSession = typeof circleVideoSessionsTable.$inferSelect;

/**
 * circle_video_participants — one attendance lease per authenticated device
 * in a video session. A participant can rejoin the same session after leaving,
 * while multiple devices for one user remain independently trackable.
 */
export const circleVideoParticipantsTable = pgTable(
  "circle_video_participants",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => circleVideoSessionsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    participantKey: text("participant_key").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    leftAt: timestamp("left_at", { withTimezone: true }),
  },
  (t) => ({
    sessionIdx: index("cvp_session_idx").on(t.sessionId),
    lastSeenIdx: index("cvp_last_seen_idx").on(t.lastSeenAt),
    uniqueParticipant: uniqueIndex("cvp_session_user_key_idx").on(
      t.sessionId,
      t.userId,
      t.participantKey,
    ),
  }),
);

export type CircleVideoParticipant = typeof circleVideoParticipantsTable.$inferSelect;

/**
 * Circle types — what kind of community this circle represents.
 * city: geography-anchored (NYC Founders Circle)
 * scene: culture/vibe-anchored (Creators Circle, Operators Circle)
 * role: identity-anchored (Investors, Founders, Women in Tech)
 * private: invitation-only small groups
 * inner_circle: top-tier membership perk, platform-curated
 */
export const CIRCLE_TYPES = [
  "city",
  "scene",
  "role",
  "private",
  "inner_circle",
] as const;

export type CircleType = (typeof CIRCLE_TYPES)[number];

/**
 * Access control model for circles.
 * open: any authenticated user may join instantly
 * request: authenticated user submits a request, host approves
 * invite_only: only invited users may join (invitation code or direct invite)
 * tier_gated: requires a specific subscription tier (see requiredTier)
 */
export const CIRCLE_ACCESS_TYPES = [
  "open",
  "request",
  "invite_only",
  "tier_gated",
] as const;

export type CircleAccessType = (typeof CIRCLE_ACCESS_TYPES)[number];

/** Membership roles within a circle. */
export const CIRCLE_MEMBER_ROLES = ["member", "moderator", "host"] as const;
export type CircleMemberRole = (typeof CIRCLE_MEMBER_ROLES)[number];

/** Membership status lifecycle. */
export const CIRCLE_MEMBER_STATUSES = ["pending", "approved", "rejected", "removed"] as const;
export type CircleMemberStatus = (typeof CIRCLE_MEMBER_STATUSES)[number];

export const circlesTable = pgTable(
  "circles",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    circleType: text("circle_type").notNull().default("scene"),
    accessType: text("access_type").notNull().default("request"),
    requiredTier: text("required_tier"),
    hostUserId: uuid("host_user_id").references(() => usersTable.id, { onDelete: "set null" }),
    city: text("city"),
    imageUrl: text("image_url"),
    accentColor: text("accent_color").notNull().default("#FFE600"),
    memberCount: integer("member_count").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    isPremium: boolean("is_premium").notNull().default(false),
    cadence: text("cadence"),

    // Live video sponsorship — brand that sponsors this room/session.
    // Set by admin; surfaced as a sponsor banner inside the live room UI.
    sponsorName:    text("sponsor_name"),
    sponsorLogoUrl: text("sponsor_logo_url"),
    sponsorCtaText: text("sponsor_cta_text"),
    sponsorCtaUrl:  text("sponsor_cta_url"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("circles_slug_idx").on(t.slug),
    typeIdx: index("circles_type_idx").on(t.circleType),
    cityIdx: index("circles_city_idx").on(t.city),
    activeIdx: index("circles_active_idx").on(t.isActive),
  })
);

export type Circle = typeof circlesTable.$inferSelect;

export const circleMembershipsTable = pgTable(
  "circle_memberships",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    circleId: uuid("circle_id")
      .notNull()
      .references(() => circlesTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    status: text("status").notNull().default("pending"),
    invitedBy: uuid("invited_by").references(() => usersTable.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    circleIdx: index("circle_memberships_circle_idx").on(t.circleId),
    userIdx: index("circle_memberships_user_idx").on(t.userId),
    statusIdx: index("circle_memberships_status_idx").on(t.status),
    uniqueMember: uniqueIndex("circle_memberships_unique").on(t.circleId, t.userId),
  })
);

export type CircleMembership = typeof circleMembershipsTable.$inferSelect;
