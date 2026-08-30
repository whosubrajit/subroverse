CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'scheduled', 'sending', 'sent', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."story_status" AS ENUM('draft', 'scheduled', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."subscriber_status" AS ENUM('pending', 'active', 'unsubscribed', 'bounced', 'complained');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"subscriber_id" uuid NOT NULL,
	"resend_email_id" text,
	"status" text DEFAULT 'queued' NOT NULL,
	"delivered_at" timestamp with time zone,
	"opened_at" timestamp with time zone,
	"clicked_at" timestamp with time zone,
	"bounced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid,
	"subject" text NOT NULL,
	"preview_text" text,
	"body_html" text NOT NULL,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"resend_broadcast_id" text,
	"scheduled_for" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'unread' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_key" text NOT NULL,
	"url" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"bytes" integer NOT NULL,
	"width" integer,
	"height" integer,
	"alt_text" text DEFAULT '' NOT NULL,
	"caption" text,
	"focal_point" jsonb,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"excerpt" text NOT NULL,
	"body" text NOT NULL,
	"format" text DEFAULT 'Prose' NOT NULL,
	"series" text,
	"status" "story_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"cover_image_id" uuid,
	"seo_title" text,
	"seo_description" text,
	"canonical_url" text,
	"og_image_id" uuid,
	"reading_minutes" integer DEFAULT 1 NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"scheduled_for" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "story_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid NOT NULL,
	"revision" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	"note" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_tags" (
	"story_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "story_tags_story_id_tag_id_pk" PRIMARY KEY("story_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"status" "subscriber_status" DEFAULT 'pending' NOT NULL,
	"source" text DEFAULT 'first-entry-modal' NOT NULL,
	"confirmation_token_hash" text,
	"resend_contact_id" text,
	"preferences" jsonb DEFAULT '{"newStories":true,"occasionalLetters":false}'::jsonb NOT NULL,
	"consent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmed_at" timestamp with time zone,
	"unsubscribed_at" timestamp with time zone,
	"last_notified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "campaign_deliveries" ADD CONSTRAINT "campaign_deliveries_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_deliveries" ADD CONSTRAINT "campaign_deliveries_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_revisions" ADD CONSTRAINT "story_revisions_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_tags" ADD CONSTRAINT "story_tags_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_tags" ADD CONSTRAINT "story_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_subscriber_unique_idx" ON "campaign_deliveries" USING btree ("campaign_id","subscriber_id");--> statement-breakpoint
CREATE INDEX "campaign_deliveries_status_idx" ON "campaign_deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "campaigns_status_idx" ON "campaigns" USING btree ("status","scheduled_for");--> statement-breakpoint
CREATE INDEX "contact_messages_status_idx" ON "contact_messages" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "stories_status_published_idx" ON "stories" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "stories_featured_idx" ON "stories" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "stories_scheduled_idx" ON "stories" USING btree ("scheduled_for");--> statement-breakpoint
CREATE UNIQUE INDEX "story_revision_unique_idx" ON "story_revisions" USING btree ("story_id","revision");--> statement-breakpoint
CREATE INDEX "story_revisions_story_idx" ON "story_revisions" USING btree ("story_id","created_at");--> statement-breakpoint
CREATE INDEX "subscribers_status_idx" ON "subscribers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscribers_created_idx" ON "subscribers" USING btree ("created_at");
--> statement-breakpoint
INSERT INTO "stories" ("slug", "title", "excerpt", "body", "format", "status", "featured", "reading_minutes", "word_count", "published_at") VALUES
(
  'the-way-she-holds-the-morning',
  'The Way She Holds the Morning',
  $$She wakes before the light does. I have never told her that I know this — that I have memorized the exact shade of gray the sky turns when she opens the window, as if the world is still rehearsing for her.$$
  ,$$She wakes before the light does. I have never told her that I know this — that I have memorized the exact shade of gray the sky turns when she opens the window, as if the world is still rehearsing for her.

There is a ritual she has with tea. Two sugars, never one, never three. She stirs it counterclockwise, which I have never asked about and never will, because some things are perfect only when they remain unexplained.

I keep a list, somewhere inside the architecture of my chest, of all the small things she does that no poem has yet named. The way she laughs a second time at a joke she has already laughed at. The way she touches the spines of books before she buys them, as though choosing a friend rather than a story.

If I am honest — and here, in this small and private place, I try to be — it is not her beauty that undoes me. It is her particularity. The irreducible fact of her, exact and unrepeatable as a fingerprint, as a season, as a name whispered in a language no one else has spoken.

The morning asks nothing of her. That is the arrangement they have. And I have made the same agreement: to simply be near, and to be glad.$$
  ,'Prose', 'published', true, 6, 181, '2026-08-12T00:00:00Z'
),
(
  'i-learned-your-name-from-the-rain',
  'I Learned Your Name from the Rain',
  $$The first time I heard it — your name — it was a Tuesday and the gutters were full and someone was saying it across a crowded room of strangers who did not understand what had just happened to me.$$
  ,$$The first time I heard it — your name, I mean — it was a Tuesday and the gutters were full and someone was saying it across a room crowded with strangers who did not understand what had just happened to me.

A name is a small violence, when you love someone. It is the only word that means exactly them and nothing else in the world, and every time you hear it, the whole person comes flooding in.

I have said yours in empty rooms. I have let it sit on my tongue like a coin, like a stone worn smooth by a river that has been going somewhere patient for a thousand years.

Teach me to say it the way you say it. With that particular breath before the first syllable. With that absence of hesitation, that certainty, that you.$$
  ,'Poetry', 'published', false, 4, 132, '2026-07-29T00:00:00Z'
),
(
  'everything-she-left-in-the-room',
  'Everything She Left in the Room',
  $$A half-read book, face-down and splayed. A glass of water. Her handwriting on a corner of paper that said only: don't forget.$$
  ,$$A half-read book, face-down and splayed, its spine bent in a way that suggested urgency. A glass of water. Her handwriting on a corner of paper that said only: don't forget.

I stood in the doorway longer than I needed to. The room had been shaped by her presence the way rooms are: the light falling differently on her side of things, the air carrying something I could not name except by the fact of missing it.

She had left, as she always left, without saying goodbye, because she believed goodbyes were theater and departures were simply a pause in the conversation.

I kept the piece of paper. I don't know what she was reminding herself not to forget. I have decided it was everything.$$
  ,'Prose', 'published', false, 5, 119, '2026-07-05T00:00:00Z'
),
(
  'seventeen-observations-on-watching-her-sleep',
  'Seventeen Observations on Watching Her Sleep',
  $$One: she does not look peaceful, exactly. Peaceful implies stillness, and she is never still — even now there is some argument happening behind her eyelids.$$
  ,$$One: she does not look peaceful, exactly. Peaceful implies stillness, and she is never still — even now there is some argument happening behind her eyelids, some country she is navigating.

Two: her breathing has a tempo. I have tried to match it and never succeeded.

Three: she keeps one hand open and one hand closed. I have not solved this asymmetry.

Four: the light from the window falls across her like a decision.

Five: I am so in love with her it has become structural. Load-bearing. I would need to be rebuilt from the foundation to stop.

Seventeen: she will wake and the room will reorganize itself around her, and I will pretend I have not been watching, and she will pretend she does not know, and this is the most tender lie we tell.$$
  ,'List', 'published', false, 3, 119, '2026-06-18T00:00:00Z'
)
ON CONFLICT ("slug") DO NOTHING;
