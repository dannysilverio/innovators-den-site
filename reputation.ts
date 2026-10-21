import { pgTable, uuid, text, integer, jsonb, boolean, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";

/**
 * Badge types — signals of contribution, trust, and excellence in the Den.
 * System badges are auto-awarded based on activity rules.
 * Honor badges are manually awarded by the platform team.
 */
export const BADGE_TYPES = [
  // Contribution
  "founding_member",     // Joined as a founding member
  "connector",           // Sent 10+ successful intro requests
  "host",                // Hosted or organized an event in the Den
  "contributor",         // Created content / contributed to community
  // Craft / Role signals
  "builder",             // Identified as a builder/maker
  "operator",            // Operational excellence
  "investor",            // Investor-tier member
  "advisor",             // Known advisor/mentor
  // Achievement
  "early_adopter",       // Among first 500 members
  "top_voice",           // Recognized thought leader in their space
  "change_maker",        // Social impact signal
  "verified_founder",    // Verified startup founder
  // Membership
  "pro_member",          // Has or had a Pro subscription
  "founding_circle",     // Lifetime founding member
] as const;

export type BadgeType = (typeof BADGE_TYPES)[number];

export const BADGE_DISPLAY: Record<BadgeType, { label: string; description: string; icon: string; color: string }> = {
  founding_member:  { label: "Founding Member",  description: "One of the original members of the Den.",                    icon: "🏛",  color: "#FFE600" },
  connector:        { label: "Connector",         description: "Has made 10+ meaningful introductions.",                     icon: "🤝",  color: "#60A5FA" },
  host:             { label: "Host",              description: "Organized or hosted a room in the Den.",                     icon: "🎙",  color: "#FF6B35" },
  contributor:      { label: "Contributor",       description: "Active contributor to the community.",                       icon: "✍",   color: "#34D399" },
  builder:          { label: "Builder",           description: "Building products that matter.",                             icon: "⚒",   color: "#7B61FF" },
  operator:         { label: "Operator",          description: "Operational excellence. Keeps things moving.",               icon: "⚙",   color: "#94A3B8" },
  investor:         { label: "Investor",          description: "Actively investing in underrepresented founders.",           icon: "📈",  color: "#34D399" },
  advisor:          { label: "Advisor",           description: "Mentors and guides founders in the network.",                icon: "🧭",  color: "#60A5FA" },
  early_adopter:    { label: "Early Adopter",     description: "Among the first 500 members of the Den.",                   icon: "⚡",  color: "#FFE600" },
  top_voice:        { label: "Top Voice",         description: "Recognized thought leader in their domain.",                 icon: "🔊",  color: "#FF4D7E" },
  change_maker:     { label: "Change Maker",      description: "Building for social impact.",                                icon: "🌍",  color: "#34D399" },
  verified_founder: { label: "Verified Founder",  description: "Verified startup or small business founder.",               icon: "🚀",  color: "#7B61FF" },
  pro_member:       { label: "Pro Member",        description: "Supporting the Den as a Pro subscriber.",                   icon: "✦",   color: "#FFE600" },
  founding_circle:  { label: "Founding Circle",   description: "Lifetime Founding Member — the highest tier of support.",  icon: "♾",   color: "#FFE600" },
};

export const userBadgesTable = pgTable(
  "user_badges",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    badgeType: text("badge_type").notNull(),
    /** Null = system auto-awarded. Non-null = manually awarded by platform admin. */
    awardedByUserId: uuid("awarded_by_user_id"),
    /** Optional context (e.g. what triggered auto-award, or an admin note). */
    awardNote: text("award_note"),
    /** Whether the badge is pinned/featured on the public profile. */
    isPinned: boolean("is_pinned").notNull().default(false),
    awardedAt: timestamp("awarded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userBadgeUniqueIdx: uniqueIndex("user_badges_unique_idx").on(t.userId, t.badgeType),
    userIdx: index("user_badges_user_idx").on(t.userId),
    badgeTypeIdx: index("user_badges_type_idx").on(t.badgeType),
  })
);

export type UserBadge = typeof userBadgesTable.$inferSelect;

/**
 * Reputation score snapshot for a user.
 * Calculated periodically from activity signals across the platform.
 * Higher score = more visibility in search, directory, and spotlight features.
 */
export const reputationScoresTable = pgTable(
  "reputation_scores",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    /** Total score (0–1000). */
    score: integer("score").notNull().default(0),
    /** Tier label derived from score bucket. */
    tier: text("tier").notNull().default("emerging"),
    /** JSON breakdown of score components for transparency. */
    components: jsonb("components").notNull().default({}),
    /** Whether this user should appear in spotlight features. */
    isSpotlighted: boolean("is_spotlighted").notNull().default(false),
    /** Visibility boost factor (1.0 = normal, 1.5 = boosted, 2.0 = featured). */
    visibilityBoost: integer("visibility_boost").notNull().default(100),
    calculatedAt: timestamp("calculated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userUniqueIdx: uniqueIndex("reputation_scores_user_idx").on(t.userId),
    scoreIdx: index("reputation_score_score_idx").on(t.score),
    spotlightIdx: index("reputation_spotlight_idx").on(t.isSpotlighted),
  })
);

export type ReputationScore = typeof reputationScoresTable.$inferSelect;

/** Score tier labels based on total score. */
export const REPUTATION_TIERS = [
  { min: 0,   max: 99,  tier: "emerging",   label: "Emerging",    color: "#94A3B8" },
  { min: 100, max: 249, tier: "rising",     label: "Rising",      color: "#60A5FA" },
  { min: 250, max: 499, tier: "established",label: "Established", color: "#34D399" },
  { min: 500, max: 749, tier: "influential",label: "Influential",  color: "#FF6B35" },
  { min: 750, max: 999, tier: "icon",       label: "Icon",        color: "#FF4D7E" },
  { min: 1000,max: Infinity, tier: "legend",label: "Legend",      color: "#FFE600" },
] as const;

export function getReputationTier(score: number) {
  return REPUTATION_TIERS.find((t) => score >= t.min && score <= t.max) ?? REPUTATION_TIERS[0];
}
