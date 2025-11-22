ALTER TABLE "images" DROP CONSTRAINT "images_bucket_id_buckets_id_fk";
--> statement-breakpoint
ALTER TABLE "images" RENAME COLUMN "bucket_id" TO "organization_id";--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "organization_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "images" ADD COLUMN "organization_slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_organization_slug_organization_slug_fk" FOREIGN KEY ("organization_slug") REFERENCES "public"."organization"("slug") ON DELETE cascade ON UPDATE no action;