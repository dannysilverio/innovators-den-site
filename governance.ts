import { pgTable, uuid, text, boolean, timestamp, integer, index, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";

/**
 * Community proposals — members can submit ideas for platform direction,
 * community programs, policies, and values. High-tier members can vote.
 */
export const PROPOSAL_CATEGORIES = [
  "platform",     // Product/feature direction
  "community",    // Community norms, culture, initiatives
  "programs",     // New programs, events, resources
  "values",       // Community values and principles
  "partnership",  // Partnerships and collaborations
  "other",
] as const;

export type ProposalCategory = (typeof PROPOSAL_CATEGORIES)[number];

export const PROPOSAL_STATUSES = [
  "open",       // Accepting votes
  "passed",     // Approved by community vote
  "declined",   // Did not reach threshold
  "implemented",// Platform has acted on this
  "archived",   // Closed without action
] as const;

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const communityProposalsTable = pgTable(
  "community_proposals",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    authorUserId: uuid("author_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    category: text("category").notNull().default("community"),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: text("status").notNull().default("open"),
    /** Minimum tier required to vote (e.g. 'pro' or 'founding'). */
    voteRequiredTier: text("vote_required_tier").notNull().default("pro"),
    /** Vote counts — denormalized for performance. */
    yesCount: integer("yes_count").notNull().default(0),
    noCount: integer("no_count").notNull().default(0),
    /** Admin/team response or update on this proposal. */
    teamResponse: text("team_response"),
    /** Date the voting period closes. */
    votingEndsAt: timestamp("voting_ends_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index("proposal_status_idx").on(t.status),
    categoryIdx: index("proposal_category_idx").on(t.category),
    authorIdx: index("proposal_author_idx").on(t.authorUserId),
  })
);

export type CommunityProposal = typeof communityProposalsTable.$inferSelect;

/** One vote per user per proposal. */
export const communityVotesTable = pgTable(
  "community_votes",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    proposalId: uuid("proposal_id")
      .notNull()
      .references(() => communityProposalsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    vote: text("vote").notNull(), // 'yes' | 'no'
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniqueVote: uniqueIndex("community_votes_unique_idx").on(t.proposalId, t.userId),
    proposalIdx: index("community_votes_proposal_idx").on(t.proposalId),
  })
);

export type CommunityVote = typeof communityVotesTable.$inferSelect;
