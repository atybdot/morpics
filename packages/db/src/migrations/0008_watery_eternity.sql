CREATE TABLE "filters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transformation_id" uuid NOT NULL,
	"blur" integer,
	"grayscale" integer,
	CONSTRAINT "filters_transformation_id_unique" UNIQUE("transformation_id")
);
--> statement-breakpoint
ALTER TABLE "transformation_metadata" RENAME COLUMN "image_id" TO "transformation_id";--> statement-breakpoint
ALTER TABLE "transformation_metadata" DROP CONSTRAINT "transformation_metadata_image_id_unique";--> statement-breakpoint
ALTER TABLE "transformation_metadata" DROP CONSTRAINT "transformation_metadata_image_id_transformation_id_fk";
--> statement-breakpoint
ALTER TABLE "filters" ADD CONSTRAINT "filters_transformation_id_transformation_id_fk" FOREIGN KEY ("transformation_id") REFERENCES "public"."transformation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transformation_metadata" ADD CONSTRAINT "transformation_metadata_transformation_id_transformation_id_fk" FOREIGN KEY ("transformation_id") REFERENCES "public"."transformation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transformation_metadata" DROP COLUMN "filter";--> statement-breakpoint
ALTER TABLE "transformation_metadata" ADD CONSTRAINT "transformation_metadata_transformation_id_unique" UNIQUE("transformation_id");