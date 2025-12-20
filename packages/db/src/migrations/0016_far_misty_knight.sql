ALTER TABLE "images" RENAME COLUMN "organization_id" TO "bucket_slug";--> statement-breakpoint
ALTER TABLE "images" DROP CONSTRAINT "images_organization_id_organization_id_fk";
--> statement-breakpoint
UPDATE "images" SET "bucket_slug" = "organization"."slug" FROM "organization" WHERE "images"."bucket_slug" = "organization"."id";
--> statement-breakpoint
ALTER TABLE "transformation" ADD COLUMN "img_key" text;--> statement-breakpoint
ALTER TABLE "transformation" ADD COLUMN "bucket_slug" text;--> statement-breakpoint
UPDATE "transformation" SET "img_key" = "images"."image_key", "bucket_slug" = "images"."bucket_slug" FROM "images" WHERE "transformation"."image_id" = "images"."id";
--> statement-breakpoint
ALTER TABLE "transformation" ALTER COLUMN "img_key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transformation" ALTER COLUMN "bucket_slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_bucket_slug_organization_slug_fk" FOREIGN KEY ("bucket_slug") REFERENCES "public"."organization"("slug") ON DELETE cascade ON UPDATE no action;