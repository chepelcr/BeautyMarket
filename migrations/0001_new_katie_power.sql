CREATE TABLE "organization_modules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar NOT NULL,
	"module_id" varchar NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"assigned_by" varchar,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_modules_org_module_uq" UNIQUE("organization_id","module_id")
);
--> statement-breakpoint
ALTER TABLE "organization_modules" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "organization_submodules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar NOT NULL,
	"submodule_id" varchar NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	CONSTRAINT "organization_submodules_org_submodule_uq" UNIQUE("organization_id","submodule_id")
);
--> statement-breakpoint
ALTER TABLE "organization_submodules" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "submodule_actions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submodule_id" varchar NOT NULL,
	"action_id" varchar NOT NULL,
	CONSTRAINT "submodule_actions_submodule_action_uq" UNIQUE("submodule_id","action_id")
);
--> statement-breakpoint
ALTER TABLE "submodule_actions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "verification_token" varchar(64);--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_modules" ADD CONSTRAINT "organization_modules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_modules" ADD CONSTRAINT "organization_modules_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_modules" ADD CONSTRAINT "organization_modules_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_submodules" ADD CONSTRAINT "organization_submodules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_submodules" ADD CONSTRAINT "organization_submodules_submodule_id_submodules_id_fk" FOREIGN KEY ("submodule_id") REFERENCES "public"."submodules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submodule_actions" ADD CONSTRAINT "submodule_actions_submodule_id_submodules_id_fk" FOREIGN KEY ("submodule_id") REFERENCES "public"."submodules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submodule_actions" ADD CONSTRAINT "submodule_actions_action_id_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "organization_modules_authenticated_access" ON "organization_modules" AS PERMISSIVE FOR ALL TO "authenticated" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "organization_submodules_authenticated_access" ON "organization_submodules" AS PERMISSIVE FOR ALL TO "authenticated" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "submodule_actions_authenticated_access" ON "submodule_actions" AS PERMISSIVE FOR ALL TO "authenticated" USING (true) WITH CHECK (true);