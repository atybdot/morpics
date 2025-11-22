CREATE TYPE "public"."image_status_enum" AS ENUM('pending', 'success', 'failed', 'orphan');--> statement-breakpoint
DROP TABLE "buckets" CASCADE;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "status" "image_status_enum" DEFAULT 'pending' NOT NULL;