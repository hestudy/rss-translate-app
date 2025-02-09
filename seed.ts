import * as bcrypt from "bcrypt";
import { reset, seed } from "drizzle-seed";
import { exit } from "process";
import { env } from "~/env";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

const main = async () => {
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(env.ADMIN_PASSWORD, salt);
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
            defaultValue: hash,
          }),
        },
      },
    };
  });
  exit();
};

await main();
