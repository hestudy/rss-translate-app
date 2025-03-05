import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
  (name) => `rss-translate-app_${name}`,
);

export const posts = createTable(
  "post",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("created_by", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    createdByIdIdx: index("created_by_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const rssOrigin = createTable("rssOrigin", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  link: varchar("link", { length: 255 }).notNull(),
  jobId: varchar("job_id", { length: 255 }),
  jobStatus: varchar("job_status", { length: 255 }),
  createdById: varchar("created_by", { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const translateData = createTable("rssData", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  data: json("data").notNull(),
  jobId: varchar("job_id", { length: 255 }),
  rssOriginId: varchar("rss_origin_id", { length: 255 })
    .notNull()
    .references(() => rssOrigin.id),
  createdById: varchar("created_by", { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const translateOrigin = createTable("translateOrigin", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  baseUrl: varchar("base_url", { length: 255 }),
  apiKey: varchar("api_key", { length: 255 }).notNull(),
  model: varchar("model", { length: 255 }).notNull(),
  createdById: varchar("created_by", { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const translatePrompt = createTable("translatePrompt", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  prompt: text("prompt").notNull(),
  createdById: varchar("created_by", { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const rssTranslate = createTable("rssTranslate", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  rssOrigin: varchar("rss_origin", { length: 255 })
    .notNull()
    .references(() => rssOrigin.id),
  translateOrigin: varchar("translate_origin", { length: 255 })
    .notNull()
    .references(() => translateOrigin.id),
  translatePrompt: varchar("translate_prompt", { length: 255 })
    .notNull()
    .references(() => translatePrompt.id),
  language: varchar("language", { length: 255 }).notNull(),
  cron: varchar("cron", { length: 255 }).notNull(),
  enabled: boolean("enabled").notNull(),
  scrapyFull: boolean("scrapy_full").default(false),
  firecrawlApiKey: varchar("firecrawl_api_key", { length: 255 }),
  createdById: varchar("created_by", { length: 255 })
    .notNull()
    .references(() => users.id),
  jobId: varchar("job_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
});

export const rssTranslateRelations = relations(
  rssTranslate,
  ({ one, many }) => ({
    rssOriginData: one(rssOrigin, {
      fields: [rssTranslate.rssOrigin],
      references: [rssOrigin.id],
    }),
    translateOriginData: one(translateOrigin, {
      fields: [rssTranslate.translateOrigin],
      references: [translateOrigin.id],
    }),
    translatePromptData: one(translatePrompt, {
      fields: [rssTranslate.translatePrompt],
      references: [translatePrompt.id],
    }),
    rssTranslateData: many(rssTranslateData),
  }),
);

export const rssTranslateData = createTable("rssTranslateData", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  feed: json("feed"),
  rssTranslateId: varchar("rss_translate_id", { length: 255 })
    .notNull()
    .references(() => rssTranslate.id, { onDelete: "cascade" }),
  jobId: varchar("job_id", { length: 255 }),
  createdById: varchar("created_by", { length: 255 }).references(
    () => users.id,
  ),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const rssTranslateDataRelation = relations(
  rssTranslateData,
  ({ one, many }) => {
    return {
      rssTranslate: one(rssTranslate, {
        fields: [rssTranslateData.rssTranslateId],
        references: [rssTranslate.id],
      }),
      rssTranslateDataItem: many(rssTranslateDataItem),
    };
  },
);

export const rssTranslateDataItem = createTable("rssTranslateDataItem", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  origin: json("origin"),
  data: json("data"),
  link: varchar("link", { length: 255 }).notNull(),
  rssTranslateDataId: varchar("rss_translate_data_id", { length: 255 })
    .notNull()
    .references(() => rssTranslateData.id, { onDelete: "cascade" }),
  jobId: varchar("job_id", { length: 255 }),
  createdById: varchar("created_by", { length: 255 }).references(
    () => users.id,
  ),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const rssTranslateDataItemRelation = relations(
  rssTranslateDataItem,
  ({ one }) => {
    return {
      rssTranslateData: one(rssTranslateData, {
        fields: [rssTranslateDataItem.rssTranslateDataId],
        references: [rssTranslateData.id],
      }),
    };
  },
);
