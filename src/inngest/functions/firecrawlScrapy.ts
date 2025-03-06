import FirecrawlApp from "@mendable/firecrawl-js";
import { inngest } from "../client";

export const firecrawlScrapy = inngest.createFunction(
  {
    id: "firecrawl-scrapy",
    concurrency: 1,
  },
  {
    event: "rss/firecrawl-scrapy",
  },
  async ({ event }) => {
    const app = new FirecrawlApp({ apiKey: event.data.apikey });
    const res = await app.scrapeUrl(event.data.url, {
      formats: ["markdown"],
    });
    if (res.success) {
      return res.markdown;
    }
  },
);
