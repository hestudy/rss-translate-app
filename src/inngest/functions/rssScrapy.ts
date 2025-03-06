import { inngest } from "../client";

export const rssScrapy = inngest.createFunction(
  { id: "rss-scrapy" },
  {
    event: "rss/scrapy",
  },
  async ({ event, logger }) => {
    logger.info(`scrapy rss: ${event.data.url}`);
    const text = await fetch(`https://r.jina.ai/${event.data.url}`).then(
      (res) => res.text(),
    );
    return text;
  },
);
