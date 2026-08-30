ALTER TABLE "campaign_deliveries" DROP COLUMN "resend_email_id";--> statement-breakpoint
ALTER TABLE "campaigns" DROP COLUMN "resend_broadcast_id";--> statement-breakpoint
ALTER TABLE "subscribers" DROP COLUMN "confirmation_token_hash";--> statement-breakpoint
ALTER TABLE "subscribers" DROP COLUMN "resend_contact_id";