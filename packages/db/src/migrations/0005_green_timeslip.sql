ALTER TABLE "images" DROP CONSTRAINT "images_organization_slug_organization_slug_fk";
--> statement-breakpoint
ALTER TABLE "images" DROP COLUMN "organization_slug";