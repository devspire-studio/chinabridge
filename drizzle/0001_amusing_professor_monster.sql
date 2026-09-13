CREATE TYPE "public"."customer_status" AS ENUM('active', 'blocked');--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "status" SET DATA TYPE "public"."customer_status" USING "status"::text::"public"."customer_status";--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "status" SET DEFAULT 'active';