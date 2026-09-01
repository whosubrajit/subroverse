CREATE TABLE "request_rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "request_rate_limits_updated_idx" ON "request_rate_limits" USING btree ("updated_at");