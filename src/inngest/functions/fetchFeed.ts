import Parser from "rss-parser";
import { z } from "zod";
import { inngest } from "../client";

const parser = new Parser();

const schema = z.object({
  url: z.string().url(),
});

export const fetchFeed = inngest.createFunction(
  {
    id: "fetch-feed",
  },
  { event: "feed/fetch" },
  async ({ event }) => {
    const validate = schema.safeParse(event.data);
    if (validate.success) {
      return await parser.parseURL(validate.data.url);
    }
  },
);
