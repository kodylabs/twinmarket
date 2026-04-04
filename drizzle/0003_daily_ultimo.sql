ALTER TABLE "agents" ADD COLUMN "wallet_address" varchar(42);--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "ens_name" varchar(255);--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "private_key" text;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "price_per_call" varchar(10) DEFAULT '$0.01' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "nullifier_hash" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_level" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_creator_id_unique" UNIQUE("creator_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_nullifier_hash_unique" UNIQUE("nullifier_hash");
