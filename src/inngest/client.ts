import { EventSchemas, Inngest } from "inngest";
import { z } from "zod";

export const inngest = new Inngest({
  id: "rss-translate-app",
  schemas: new EventSchemas().fromZod({
    "rss/scrapy": {
      data: z.object({
        url: z.string().url(),
      }),
    },
    "rss/firecrawl-scrapy": {
      data: z.object({
        url: z.string().url(),
        apikey: z.string().nonempty(),
      }),
    },
    "rss/fetch": {
      data: z.object({
        url: z.string().url(),
      }),
    },
    "text/split": {
      data: z.object({
        content: z.string().nonempty(),
      }),
    },
    "text/translate": {
      data: z.object({
        prompt: z.string().nonempty(),
        baseUrl: z.string().optional(),
        model: z.string().nonempty(),
        apiKey: z.string().nonempty(),
        content: z.string().optional(),
        language: z.string().nonempty(),
      }),
    },
    "md/to-html": {
      data: z.object({
        content: z.string().nonempty(),
      }),
    },
  }),
});
