ALTER TABLE "usage" ADD COLUMN "buckets" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "usage" ADD COLUMN "seats" jsonb DEFAULT '[]'::jsonb NOT NULL;