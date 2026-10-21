import { pgTable, uuid, text, boolean, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";

/**
 * Partner account types — what role the organization plays in the network.
 * employer: posts jobs and internships (doors)
 * brand: runs brand-deal opportunities and sponsorships
 * partner: general strategic partner (can submit events + opportunities)
 * organizer: runs rooms and events
 * recruiter: recruits on behalf of companies
 */
export const PARTNER_ORG_TYPES = [
  "employer",
  "brand",
  "partner",
  "organizer",
  "recruiter",
] as const;

export type PartnerOrgType = (typeof PARTNER_ORG_TYPES)[number];

/**
 * Partner account status lifecycle.
 * pending: submitted, awaiting platform review
 * approved: active and allowed to post listings
 * suspended: temporarily locked from posting
 * rejected: application denied
 */
export const PARTNER_STATUSES = ["pending", "approved", "suspended", "rejected"] as const;
export type PartnerStatus = (typeof PARTNER_STATUSES)[number];

/** Verification tier — indicates how much the platform has vetted this partner. */
export const PARTNER_VERIFICATION_STATUSES = ["unverified", "verified", "featured"] as const;
export type PartnerVerificationStatus = (typeof PARTNER_VERIFICATION_STATUSES)[number];

export const partnerAccountsTable = pgTable(
  "partner_accounts",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    /** The platform user who owns this partner account. */
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    orgName: text("org_name").notNull(),
    orgType: text("org_type").notNull().default("partner"),
    website: text("website"),
    contactEmail: text("contact_email"),
    bio: text("bio"),
    logoUrl: text("logo_url"),
    /** Platform review of this account. Default pending. */
    status: text("status").notNull().default("pending"),
    /** Trust/vetting signal shown on listings. */
    verificationStatus: text("verification_status").notNull().default("unverified"),
    /** Whether this partner is allowed to post listings immediately (admin override). */
    canPostImmediately: boolean("can_post_immediately").notNull().default(false),
    reviewedByUserId: uuid("reviewed_by_user_id"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewNotes: text("review_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: uniqueIndex("partner_accounts_user_idx").on(t.userId),
    statusIdx: index("partner_accounts_status_idx").on(t.status),
    typeIdx: index("partner_accounts_type_idx").on(t.orgType),
  })
);

export type PartnerAccount = typeof partnerAccountsTable.$inferSelect;
