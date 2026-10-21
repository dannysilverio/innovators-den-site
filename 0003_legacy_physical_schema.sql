-- SQL-created legacy objects found by a read-only development schema inventory.
CREATE SEQUENCE IF NOT EXISTS "ic_waitlist_id_seq" AS integer START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 NO CYCLE;
CREATE TABLE IF NOT EXISTS "ic_waitlist" (
"id" integer DEFAULT nextval('ic_waitlist_id_seq'::regclass) NOT NULL,
"email" text NOT NULL,
"name" text,
"referral_code" text,
"source" text DEFAULT 'web'::text,
"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "submitted_by_partner_id" uuid;
ALTER TABLE "opportunities" ADD COLUMN IF NOT EXISTS "submitted_by_partner_id" uuid;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public."ic_waitlist"'::regclass AND conname='ic_waitlist_email_key') THEN ALTER TABLE "ic_waitlist" ADD CONSTRAINT "ic_waitlist_email_key" UNIQUE (email); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public."ic_waitlist"'::regclass AND conname='ic_waitlist_pkey') THEN ALTER TABLE "ic_waitlist" ADD CONSTRAINT "ic_waitlist_pkey" PRIMARY KEY (id); END IF; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS ic_waitlist_email_key ON public.ic_waitlist USING btree (email);
CREATE UNIQUE INDEX IF NOT EXISTS ic_waitlist_pkey ON public.ic_waitlist USING btree (id);
