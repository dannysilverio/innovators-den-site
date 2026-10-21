import { pgTable, text, uuid, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Data retention policy: Delete inactive user records after 24 months of no login.
 * PII fields: device_id, display_name, email, phone.
 * Email and phone are NEVER returned in public-facing API responses.
 */
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: text("device_id").notNull().unique(),
  displayName: text("display_name"),

  // Role: 'user' (default), 'editor' (can approve articles), 'admin' (full access)
  role: text("role").notNull().default("user"),

  // Subscription: 'free' (default), 'pro', 'founding'
  subscriptionTier: text("subscription_tier").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionExpiresAt: timestamp("subscription_expires_at", { withTimezone: true }),

  // Referral
  referralCode: text("referral_code").unique(),
  referredByCode: text("referred_by_code"),
  referralCount: text("referral_count").notNull().default("0"),

  // PII — only returned to the owning device, never to other users
  email: text("email"),
  phone: text("phone"),

  // Marketing consent — must be explicit opt-in, never default true (CAN-SPAM / TCPA)
  emailSubscribed: boolean("email_subscribed").notNull().default(false),
  emailConsentAt: timestamp("email_consent_at", { withTimezone: true }),
  smsOptIn: boolean("sms_opt_in").notNull().default(false),
  smsConsentAt: timestamp("sms_consent_at", { withTimezone: true }),

  // Terms of service acceptance record
  termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
  termsVersion: text("terms_version"),

  topicPreferences: text("topic_preferences").array().notNull().default(sql`'{}'::text[]`),

  // Primary intent: what the user is here for (set during onboarding)
  // Values: 'inspiration' | 'opportunities' | 'networking' | 'learning'
  primaryIntent: text("primary_intent"),

  // Professional identity (captured during post-signup profile setup)
  jobTitle:  text("job_title"),
  company:   text("company"),
  industry:  text("industry"),
  city:      text("city"),
  skills:    text("skills").array().notNull().default(sql`'{}'::text[]`),

  // Social / Rise Profile links (optional, user-provided)
  instagramHandle: text("instagram_handle"),
  linkedinUrl:     text("linkedin_url"),
  twitterHandle:   text("twitter_handle"),
  websiteUrl:      text("website_url"),
  bio:             text("bio"),

  // Rise Profile public status — short member-set status line
  // e.g. "Building in Atlanta", "Hiring engineers", "Open to advisory roles"
  riseStatus: text("rise_status"),

  // Poster trust and reputation
  // trustLevel: 'new' → default; 'trusted' → consistent approved submissions; 'flagged' → reports confirmed
  trustLevel: text("trust_level").notNull().default("new"),
  reputationScore: integer("reputation_score").notNull().default(0),

  // Intro / Connect settings
  // openToConnect: if false, no one can send this user an intro request
  openToConnect: boolean("open_to_connect").notNull().default(false),
  // connectionIntents: which intent types this person is open to
  // Values from INTRO_INTENT_TYPES: collaborate | hire | invest | advise | speak | partner | other
  connectionIntents: text("connection_intents").array().notNull().default(sql`'{}'::text[]`),

  // Creator program — invitation-code gated write access
  isCreator: boolean("is_creator").notNull().default(false),
  creatorCodeUsed: text("creator_code_used"),

  // Expo push token for device push notifications (registered on launch)
  pushToken: text("push_token"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, lastSeenAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
