ALTER TABLE "filters" ALTER COLUMN "grayscale" SET DATA TYPE boolean USING grayscale::boolean;--> statement-breakpoint
ALTER TABLE "transformation" ADD COLUMN "transformation_query" text NOT NULL;--> statement-breakpoint
ALTER TABLE "transformation" DROP COLUMN "cache_key";