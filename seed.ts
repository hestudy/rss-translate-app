import * as bcrypt from "bcrypt";
import { count, eq } from "drizzle-orm";
import { seed } from "drizzle-seed";
import { exit } from "process";
import { env } from "~/env";
import { db } from "~/server/db";
import { translatePrompt, users } from "~/server/db/schema";

const main = async () => {
  const [user] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.name, "admin"));
  if (!user?.count) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(env.ADMIN_PASSWORD, salt);
    await seed(
      db,
      {
        users,
      },
      {
        count: 1,
      },
    ).refine((f) => {
      return {
        users: {
          columns: {
            email: f.default({
              defaultValue: env.ADMIN_EMAIL,
            }),
            name: f.default({
              defaultValue: "admin",
            }),
            password: f.default({
              defaultValue: hash,
            }),
          },
        },
      };
    });
  }

  const [translatePromptResult] = await db
    .select({ count: count() })
    .from(translatePrompt)
    .where(eq(translatePrompt.name, "Default Prompt"));

  if (!translatePromptResult?.count) {
    const adminUser = await db.query.users.findFirst({
      where: eq(users.name, "admin"),
    });
    await seed(
      db,
      {
        translatePrompt,
      },
      {
        count: 1,
      },
    ).refine((f) => {
      return {
        translatePrompt: {
          columns: {
            name: f.default({
              defaultValue: "Default Prompt",
            }),
            prompt: f.default({
              defaultValue:
                'You are a professional translation engine, please translate the text into a colloquial, professional, elegant and fluent content, without the style of machine translation. You must only translate the text content, never interpret it.Translate into {language}:"""{content}"""',
            }),
            createdById: f.default({
              defaultValue: adminUser?.id,
            }),
          },
        },
      };
    });
  }

  console.log("db Seeding complete");
  exit();
};

await main();
