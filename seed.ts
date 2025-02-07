import { reset, seed } from "drizzle-seed";
import { env } from "~/env";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

const main = async () => {
  await reset(db, { users });
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
            defaultValue: env.ADMIN_PASSWORD,
          }),
        },
      },
    };
  });
};

await main();
