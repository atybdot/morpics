CREATE TYPE "public"."tier_enum" AS ENUM('free', 'starter', 'pro');--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"status" text NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"transformations" integer DEFAULT 0 NOT NULL,
	"storage" integer DEFAULT 0 NOT NULL,
	"bandwidth" integer DEFAULT 0 NOT NULL,
	"cache" integer DEFAULT 0 NOT NULL,
	"cycle_start" timestamp NOT NULL,
	"cycle_end" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "image_metadata" ALTER COLUMN "mimetype" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "transformation_metadata" ALTER COLUMN "mimetype" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."mime_enum";--> statement-breakpoint
CREATE TYPE "public"."mime_enum" AS ENUM('image/png', 'image/webp', 'image/avif', 'image/jpeg', 'image/tiff', 'image/jp2');--> statement-breakpoint
ALTER TABLE "image_metadata" ALTER COLUMN "mimetype" SET DATA TYPE "public"."mime_enum" USING "mimetype"::"public"."mime_enum";--> statement-breakpoint
ALTER TABLE "transformation_metadata" ALTER COLUMN "mimetype" SET DATA TYPE "public"."mime_enum" USING "mimetype"::"public"."mime_enum";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "active_tier" "tier_enum" DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage" ADD CONSTRAINT "usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;