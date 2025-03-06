import Parser from "rss-parser";
import { z } from "zod";
import { inngest } from "../client";

const parser = new Parser();

export const fetchFeed = inngest.createFunction(
  {
    id: "fetch-feed",
  },
  { event: "rss/fetch" },
  async ({ event }) => {
    return await parser.parseURL(event.data.url);
  },
);
