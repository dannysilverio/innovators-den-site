CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"content" text,
	"video_url" text,
	"video_poster_url" text,
	"video_caption" text,
	"source_name" text NOT NULL,
	"source_url" text NOT NULL,
	"image_url" text,
	"topic" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"ai_score" integer,
	"is_sponsored" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tags" text[] DEFAULT '{}'::text[],
	"entities" text[] DEFAULT '{}'::text[],
	"editorial_quality_score" real DEFAULT 0.5,
	"novelty_score" real DEFAULT 0,
	"trend_score" real DEFAULT 0,
	"publish_at" timestamp with time zone,
	"review_note" text,
	"is_creator_content" boolean DEFAULT false NOT NULL,
	"submitted_by_user_id" uuid,
	"submitted_by_name" text
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sub_brand" text,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" text NOT NULL,
	"display_name" text,
	"role" text DEFAULT 'user' NOT NULL,
	"subscription_tier" text DEFAULT 'free' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"subscription_expires_at" timestamp with time zone,
	"referral_code" text,
	"referred_by_code" text,
	"referral_count" text DEFAULT '0' NOT NULL,
	"email" text,
	"phone" text,
	"email_subscribed" boolean DEFAULT false NOT NULL,
	"email_consent_at" timestamp with time zone,
	"sms_opt_in" boolean DEFAULT false NOT NULL,
	"sms_consent_at" timestamp with time zone,
	"terms_accepted_at" timestamp with time zone,
	"terms_version" text,
	"topic_preferences" text[] DEFAULT '{}'::text[] NOT NULL,
	"primary_intent" text,
	"job_title" text,
	"company" text,
	"industry" text,
	"city" text,
	"skills" text[] DEFAULT '{}'::text[] NOT NULL,
	"instagram_handle" text,
	"linkedin_url" text,
	"twitter_handle" text,
	"website_url" text,
	"bio" text,
	"rise_status" text,
	"trust_level" text DEFAULT 'new' NOT NULL,
	"reputation_score" integer DEFAULT 0 NOT NULL,
	"open_to_connect" boolean DEFAULT false NOT NULL,
	"connection_intents" text[] DEFAULT '{}'::text[] NOT NULL,
	"is_creator" boolean DEFAULT false NOT NULL,
	"creator_code_used" text,
	"push_token" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_device_id_unique" UNIQUE("device_id"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "article_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"article_id" uuid NOT NULL,
	"interaction_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_interest_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"topic" text NOT NULL,
	"score" real DEFAULT 0 NOT NULL,
	"interaction_count" integer DEFAULT 0 NOT NULL,
	"last_interacted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_topic_unique" UNIQUE("user_id","topic")
);
--> statement-breakpoint
CREATE TABLE "user_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"article_id" uuid,
	"event_type" text NOT NULL,
	"event_value" real DEFAULT 1,
	"dwell_seconds" integer,
	"scroll_depth" real,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preference_vectors" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"vertical_scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"tag_scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"source_scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"entity_scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"format_scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "innovators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"bio" text NOT NULL,
	"avatar_url" text,
	"topics" text[] DEFAULT '{}'::text[] NOT NULL,
	"location" text,
	"instagram_url" text,
	"twitter_url" text,
	"linkedin_url" text,
	"website_url" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_id" text NOT NULL,
	"password_hash" text,
	"reset_token" text,
	"reset_token_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_rsvps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" text,
	"device_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_rsvps_event_device_uniq" UNIQUE("event_id","device_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"location" text NOT NULL,
	"address" text,
	"city" text,
	"event_date" timestamp with time zone NOT NULL,
	"event_end_date" timestamp with time zone,
	"type" text DEFAULT 'in-person' NOT NULL,
	"category" text DEFAULT 'Innovation' NOT NULL,
	"rsvp_url" text,
	"price" text DEFAULT 'Free' NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"organizer" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"organization" text NOT NULL,
	"image_url" text,
	"type" text DEFAULT 'grant' NOT NULL,
	"category" text DEFAULT 'Innovation' NOT NULL,
	"amount" text,
	"deadline" timestamp with time zone,
	"apply_url" text,
	"location" text,
	"is_remote" boolean DEFAULT false NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_notification_prefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"topic" text NOT NULL,
	"notify_stories" boolean DEFAULT false NOT NULL,
	"notify_opportunities" boolean DEFAULT false NOT NULL,
	"notify_events" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "follows_user_target_uniq" UNIQUE("user_id","target_type","target_id")
);
--> statement-breakpoint
CREATE TABLE "inbox_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text DEFAULT 'system' NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"image_url" text,
	"action_url" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_user_id" uuid NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"reason" text NOT NULL,
	"details" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by_user_id" uuid,
	"reviewed_at" timestamp with time zone,
	"review_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_action_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"action_type" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"notes" text,
	"meta" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intro_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"intro_request_id" uuid NOT NULL,
	"sender_user_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intro_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_user_id" uuid NOT NULL,
	"recipient_user_id" uuid NOT NULL,
	"intent_type" text NOT NULL,
	"note" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp with time zone,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "circle_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"circle_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"invited_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "circle_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"circle_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"body" text NOT NULL,
	"message_type" text DEFAULT 'message' NOT NULL,
	"parent_id" uuid,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"like_count" integer DEFAULT 0 NOT NULL,
	"reply_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "circle_video_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"participant_key" text NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "circle_video_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"circle_id" uuid NOT NULL,
	"started_by" uuid NOT NULL,
	"room_name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"participant_count" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "circles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"circle_type" text DEFAULT 'scene' NOT NULL,
	"access_type" text DEFAULT 'request' NOT NULL,
	"required_tier" text,
	"host_user_id" uuid,
	"city" text,
	"image_url" text,
	"accent_color" text DEFAULT '#FFE600' NOT NULL,
	"member_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"cadence" text,
	"sponsor_name" text,
	"sponsor_logo_url" text,
	"sponsor_cta_text" text,
	"sponsor_cta_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"org_name" text NOT NULL,
	"org_type" text DEFAULT 'partner' NOT NULL,
	"website" text,
	"contact_email" text,
	"bio" text,
	"logo_url" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"verification_status" text DEFAULT 'unverified' NOT NULL,
	"can_post_immediately" boolean DEFAULT false NOT NULL,
	"reviewed_by_user_id" uuid,
	"reviewed_at" timestamp with time zone,
	"review_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reputation_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"tier" text DEFAULT 'emerging' NOT NULL,
	"components" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_spotlighted" boolean DEFAULT false NOT NULL,
	"visibility_boost" integer DEFAULT 100 NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"badge_type" text NOT NULL,
	"awarded_by_user_id" uuid,
	"award_note" text,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "concierge_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"member_tier" text DEFAULT 'pro' NOT NULL,
	"request_type" text DEFAULT 'other' NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"assigned_to_user_id" uuid,
	"team_notes" text,
	"member_update" text,
	"is_urgent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "marketplace_inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"inquirer_user_id" uuid NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"owner_reply" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"replied_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "marketplace_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"category" text DEFAULT 'other' NOT NULL,
	"description" text NOT NULL,
	"rate" text,
	"rate_unit" text DEFAULT 'per_project' NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"image_url" text,
	"booking_url" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intelligence_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text DEFAULT 'trend' NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"content" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"required_tier" text DEFAULT 'founding' NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"period" text,
	"author_user_id" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_user_id" uuid NOT NULL,
	"category" text DEFAULT 'community' NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"vote_required_tier" text DEFAULT 'pro' NOT NULL,
	"yes_count" integer DEFAULT 0 NOT NULL,
	"no_count" integer DEFAULT 0 NOT NULL,
	"team_response" text,
	"voting_ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"vote" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advertiser_name" text NOT NULL,
	"campaign_name" text NOT NULL,
	"campaign_type" text DEFAULT 'direct' NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"target_url" text,
	"targeting" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"booked_value" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"placement_id" uuid,
	"campaign_id" uuid,
	"slot_key" text NOT NULL,
	"platform" text,
	"page_or_screen" text,
	"membership_tier" text DEFAULT 'free',
	"user_id" uuid,
	"is_house_ad" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_creatives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"creative_type" text NOT NULL,
	"headline" text NOT NULL,
	"body" text,
	"image_url" text,
	"logo_url" text,
	"brand_name" text,
	"category" text,
	"logo_char" text,
	"cta" text DEFAULT 'Learn More' NOT NULL,
	"sponsor_label" text,
	"accent_color" text DEFAULT '#FFE600',
	"theme" text DEFAULT 'dark' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_impressions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"placement_id" uuid,
	"campaign_id" uuid,
	"slot_key" text NOT NULL,
	"platform" text,
	"page_or_screen" text,
	"membership_tier" text DEFAULT 'free',
	"user_id" uuid,
	"is_house_ad" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_inventory_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slot_key" text NOT NULL,
	"gam_path" text,
	"name" text NOT NULL,
	"platform" text DEFAULT 'both' NOT NULL,
	"page_or_screen" text NOT NULL,
	"placement_type" text NOT NULL,
	"format_type" text NOT NULL,
	"product_type" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"description" text,
	"membership_visibility" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"targeting" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ad_inventory_slots_slot_key_unique" UNIQUE("slot_key")
);
--> statement-breakpoint
CREATE TABLE "ad_placements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"slot_id" uuid NOT NULL,
	"creative_id" uuid NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"tier_exclusions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"page_targeting" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"city_targeting" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"topic_targeting" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" text NOT NULL,
	"article_id" text NOT NULL,
	"article_title" text NOT NULL,
	"article_summary" text DEFAULT '' NOT NULL,
	"article_source_name" text DEFAULT '' NOT NULL,
	"article_image_url" text,
	"article_topic" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracked_doors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" text NOT NULL,
	"door_id" text NOT NULL,
	"title" text NOT NULL,
	"organization" text DEFAULT '' NOT NULL,
	"door_type" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'saved' NOT NULL,
	"tracked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaborations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"skills" text[] DEFAULT '{}'::text[],
	"equity" text,
	"contact_method" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"redeemed_at" timestamp with time zone,
	"redeemed_by_user_id" text,
	CONSTRAINT "creator_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "promo_code_redemptions" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"promo_code_id" text NOT NULL,
	"user_id" text NOT NULL,
	"redeemed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promo_codes" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"uses_allowed" integer,
	"uses_remaining" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "article_interactions" ADD CONSTRAINT "article_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_interactions" ADD CONSTRAINT "article_interactions_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interest_profiles" ADD CONSTRAINT "user_interest_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_events" ADD CONSTRAINT "user_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_events" ADD CONSTRAINT "user_events_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preference_vectors" ADD CONSTRAINT "user_preference_vectors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notification_prefs" ADD CONSTRAINT "user_notification_prefs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_user_id_users_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_action_logs" ADD CONSTRAINT "admin_action_logs_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intro_messages" ADD CONSTRAINT "intro_messages_intro_request_id_intro_requests_id_fk" FOREIGN KEY ("intro_request_id") REFERENCES "public"."intro_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intro_messages" ADD CONSTRAINT "intro_messages_sender_user_id_users_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intro_requests" ADD CONSTRAINT "intro_requests_sender_user_id_users_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intro_requests" ADD CONSTRAINT "intro_requests_recipient_user_id_users_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_memberships" ADD CONSTRAINT "circle_memberships_circle_id_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_memberships" ADD CONSTRAINT "circle_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_memberships" ADD CONSTRAINT "circle_memberships_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_posts" ADD CONSTRAINT "circle_posts_circle_id_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_posts" ADD CONSTRAINT "circle_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_video_participants" ADD CONSTRAINT "circle_video_participants_session_id_circle_video_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."circle_video_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_video_participants" ADD CONSTRAINT "circle_video_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_video_sessions" ADD CONSTRAINT "circle_video_sessions_circle_id_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_video_sessions" ADD CONSTRAINT "circle_video_sessions_started_by_users_id_fk" FOREIGN KEY ("started_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circles" ADD CONSTRAINT "circles_host_user_id_users_id_fk" FOREIGN KEY ("host_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_accounts" ADD CONSTRAINT "partner_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reputation_scores" ADD CONSTRAINT "reputation_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concierge_requests" ADD CONSTRAINT "concierge_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_inquiries" ADD CONSTRAINT "marketplace_inquiries_listing_id_marketplace_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_inquiries" ADD CONSTRAINT "marketplace_inquiries_inquirer_user_id_users_id_fk" FOREIGN KEY ("inquirer_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intelligence_reports" ADD CONSTRAINT "intelligence_reports_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_proposals" ADD CONSTRAINT "community_proposals_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_votes" ADD CONSTRAINT "community_votes_proposal_id_community_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."community_proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_votes" ADD CONSTRAINT "community_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_clicks" ADD CONSTRAINT "ad_clicks_placement_id_ad_placements_id_fk" FOREIGN KEY ("placement_id") REFERENCES "public"."ad_placements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_clicks" ADD CONSTRAINT "ad_clicks_campaign_id_ad_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."ad_campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_clicks" ADD CONSTRAINT "ad_clicks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_creatives" ADD CONSTRAINT "ad_creatives_campaign_id_ad_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."ad_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_impressions" ADD CONSTRAINT "ad_impressions_placement_id_ad_placements_id_fk" FOREIGN KEY ("placement_id") REFERENCES "public"."ad_placements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_impressions" ADD CONSTRAINT "ad_impressions_campaign_id_ad_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."ad_campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_impressions" ADD CONSTRAINT "ad_impressions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_placements" ADD CONSTRAINT "ad_placements_campaign_id_ad_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."ad_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_placements" ADD CONSTRAINT "ad_placements_slot_id_ad_inventory_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."ad_inventory_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_placements" ADD CONSTRAINT "ad_placements_creative_id_ad_creatives_id_fk" FOREIGN KEY ("creative_id") REFERENCES "public"."ad_creatives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_code_redemptions" ADD CONSTRAINT "promo_code_redemptions_promo_code_id_promo_codes_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reports_target_idx" ON "reports" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "reports_reporter_idx" ON "reports" USING btree ("reporter_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reports_unique_per_user" ON "reports" USING btree ("reporter_user_id","target_type","target_id","reason");--> statement-breakpoint
CREATE INDEX "admin_action_logs_admin_idx" ON "admin_action_logs" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX "admin_action_logs_target_idx" ON "admin_action_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "admin_action_logs_action_idx" ON "admin_action_logs" USING btree ("action_type");--> statement-breakpoint
CREATE INDEX "admin_action_logs_created_idx" ON "admin_action_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "intro_messages_request_idx" ON "intro_messages" USING btree ("intro_request_id");--> statement-breakpoint
CREATE INDEX "intro_messages_sender_idx" ON "intro_messages" USING btree ("sender_user_id");--> statement-breakpoint
CREATE INDEX "intro_messages_created_idx" ON "intro_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "intro_requests_sender_idx" ON "intro_requests" USING btree ("sender_user_id");--> statement-breakpoint
CREATE INDEX "intro_requests_recipient_idx" ON "intro_requests" USING btree ("recipient_user_id");--> statement-breakpoint
CREATE INDEX "intro_requests_status_idx" ON "intro_requests" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "intro_requests_unique_pair" ON "intro_requests" USING btree ("sender_user_id","recipient_user_id");--> statement-breakpoint
CREATE INDEX "circle_memberships_circle_idx" ON "circle_memberships" USING btree ("circle_id");--> statement-breakpoint
CREATE INDEX "circle_memberships_user_idx" ON "circle_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "circle_memberships_status_idx" ON "circle_memberships" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "circle_memberships_unique" ON "circle_memberships" USING btree ("circle_id","user_id");--> statement-breakpoint
CREATE INDEX "circle_posts_circle_idx" ON "circle_posts" USING btree ("circle_id","created_at");--> statement-breakpoint
CREATE INDEX "circle_posts_user_idx" ON "circle_posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "circle_posts_parent_idx" ON "circle_posts" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "cvp_session_idx" ON "circle_video_participants" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "cvp_last_seen_idx" ON "circle_video_participants" USING btree ("last_seen_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cvp_session_user_key_idx" ON "circle_video_participants" USING btree ("session_id","user_id","participant_key");--> statement-breakpoint
CREATE INDEX "cvs_circle_active_idx" ON "circle_video_sessions" USING btree ("circle_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "circles_slug_idx" ON "circles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "circles_type_idx" ON "circles" USING btree ("circle_type");--> statement-breakpoint
CREATE INDEX "circles_city_idx" ON "circles" USING btree ("city");--> statement-breakpoint
CREATE INDEX "circles_active_idx" ON "circles" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "partner_accounts_user_idx" ON "partner_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "partner_accounts_status_idx" ON "partner_accounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "partner_accounts_type_idx" ON "partner_accounts" USING btree ("org_type");--> statement-breakpoint
CREATE UNIQUE INDEX "reputation_scores_user_idx" ON "reputation_scores" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reputation_score_score_idx" ON "reputation_scores" USING btree ("score");--> statement-breakpoint
CREATE INDEX "reputation_spotlight_idx" ON "reputation_scores" USING btree ("is_spotlighted");--> statement-breakpoint
CREATE UNIQUE INDEX "user_badges_unique_idx" ON "user_badges" USING btree ("user_id","badge_type");--> statement-breakpoint
CREATE INDEX "user_badges_user_idx" ON "user_badges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_badges_type_idx" ON "user_badges" USING btree ("badge_type");--> statement-breakpoint
CREATE INDEX "concierge_user_idx" ON "concierge_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "concierge_status_idx" ON "concierge_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "concierge_type_idx" ON "concierge_requests" USING btree ("request_type");--> statement-breakpoint
CREATE INDEX "marketplace_inquiry_listing_idx" ON "marketplace_inquiries" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "marketplace_inquiry_inquirer_idx" ON "marketplace_inquiries" USING btree ("inquirer_user_id");--> statement-breakpoint
CREATE INDEX "marketplace_user_idx" ON "marketplace_listings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "marketplace_category_idx" ON "marketplace_listings" USING btree ("category");--> statement-breakpoint
CREATE INDEX "marketplace_status_idx" ON "marketplace_listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "marketplace_featured_idx" ON "marketplace_listings" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "intelligence_type_idx" ON "intelligence_reports" USING btree ("type");--> statement-breakpoint
CREATE INDEX "intelligence_public_idx" ON "intelligence_reports" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "intelligence_published_idx" ON "intelligence_reports" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "proposal_status_idx" ON "community_proposals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "proposal_category_idx" ON "community_proposals" USING btree ("category");--> statement-breakpoint
CREATE INDEX "proposal_author_idx" ON "community_proposals" USING btree ("author_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "community_votes_unique_idx" ON "community_votes" USING btree ("proposal_id","user_id");--> statement-breakpoint
CREATE INDEX "community_votes_proposal_idx" ON "community_votes" USING btree ("proposal_id");--> statement-breakpoint
CREATE INDEX "ad_campaign_status_idx" ON "ad_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ad_click_slot_idx" ON "ad_clicks" USING btree ("slot_key");--> statement-breakpoint
CREATE INDEX "ad_click_campaign_idx" ON "ad_clicks" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "ad_creative_campaign_idx" ON "ad_creatives" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "ad_impression_slot_idx" ON "ad_impressions" USING btree ("slot_key");--> statement-breakpoint
CREATE INDEX "ad_impression_campaign_idx" ON "ad_impressions" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "ad_impression_created_idx" ON "ad_impressions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ad_slot_platform_idx" ON "ad_inventory_slots" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "ad_slot_page_idx" ON "ad_inventory_slots" USING btree ("page_or_screen");--> statement-breakpoint
CREATE INDEX "ad_slot_active_idx" ON "ad_inventory_slots" USING btree ("active");--> statement-breakpoint
CREATE INDEX "ad_placement_slot_idx" ON "ad_placements" USING btree ("slot_id");--> statement-breakpoint
CREATE INDEX "ad_placement_campaign_idx" ON "ad_placements" USING btree ("campaign_id");--> statement-breakpoint
CREATE INDEX "ad_placement_active_idx" ON "ad_placements" USING btree ("active");--> statement-breakpoint
CREATE INDEX "collaborations_user_idx" ON "collaborations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "collaborations_type_idx" ON "collaborations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "collaborations_status_idx" ON "collaborations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "collaborations_created_idx" ON "collaborations" USING btree ("created_at");