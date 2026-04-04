ALTER TABLE "users" ADD COLUMN "nullifier_hash" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_level" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_nullifier_hash_unique" UNIQUE("nullifier_hash");