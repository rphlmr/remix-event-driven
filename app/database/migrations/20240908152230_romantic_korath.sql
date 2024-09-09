CREATE TABLE IF NOT EXISTS "order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" text DEFAULT 'pending',
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT null
);
