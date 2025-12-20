ALTER TABLE "filters" RENAME COLUMN "transformation_id" TO "transformation_metadata_id";--> statement-breakpoint
ALTER TABLE "filters" DROP CONSTRAINT "filters_transformation_id_unique";--> statement-breakpoint
ALTER TABLE "filters" DROP CONSTRAINT "filters_transformation_id_transformation_id_fk";
--> statement-breakpoint
ALTER TABLE "filters" ADD CONSTRAINT "filters_transformation_metadata_id_transformation_metadata_id_fk" FOREIGN KEY ("transformation_metadata_id") REFERENCES "public"."transformation_metadata"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "filters" ADD CONSTRAINT "filters_transformation_metadata_id_unique" UNIQUE("transformation_metadata_id");