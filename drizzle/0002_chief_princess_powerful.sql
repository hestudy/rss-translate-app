CREATE TABLE IF NOT EXISTS "rss-translate-app_newRssTranslateData" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"feed" json,
	"rss_translate_id" varchar(255) NOT NULL,
	"job_id" varchar(255),
	"created_by" varchar(255),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rss-translate-app_newRssTranslateDataItem" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"origin" json,
	"data" json,
	"link" varchar(255) NOT NULL,
	"new_rss_translate_data_id" varchar(255) NOT NULL,
	"job_id" varchar(255),
	"created_by" varchar(255),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rss-translate-app_newRssTranslateData" ADD CONSTRAINT "rss-translate-app_newRssTranslateData_rss_translate_id_rss-translate-app_rssTranslate_id_fk" FOREIGN KEY ("rss_translate_id") REFERENCES "public"."rss-translate-app_rssTranslate"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rss-translate-app_newRssTranslateData" ADD CONSTRAINT "rss-translate-app_newRssTranslateData_created_by_rss-translate-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."rss-translate-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rss-translate-app_newRssTranslateDataItem" ADD CONSTRAINT "rss-translate-app_newRssTranslateDataItem_new_rss_translate_data_id_rss-translate-app_newRssTranslateData_id_fk" FOREIGN KEY ("new_rss_translate_data_id") REFERENCES "public"."rss-translate-app_newRssTranslateData"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rss-translate-app_newRssTranslateDataItem" ADD CONSTRAINT "rss-translate-app_newRssTranslateDataItem_created_by_rss-translate-app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."rss-translate-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
