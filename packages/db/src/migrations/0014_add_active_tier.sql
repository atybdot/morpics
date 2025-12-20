-- Add enum type for user tiers (if not already present)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tier_enum') THEN
        CREATE TYPE "tier_enum" AS ENUM ('free', 'starter', 'pro');
    END IF;
END$$;

-- Add active_tier column to user table with default 'free'
ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS "active_tier" "tier_enum" DEFAULT 'free' NOT NULL;
