import { z } from "zod";

export const createRssTranslateSchema = z.object({
  rssOrigin: z.string().nonempty(),
  translateOrigin: z.string().nonempty(),
  translatePrompt: z.string().nonempty(),
  language: z.string().nonempty(),
  enabled: z.boolean(),
  cron: z.custom<string>((val: string) => {
    // validate cron
    if (!/^(\*|[0-9]|[0-9][0-9]|[1-5][0-9][0-9]|[1-9][0-9]|[1-9])$/.test(val)) {
      return "cron is invalid";
    }
    return true;
  }),
});

export const updateRssTranslateSchema = createRssTranslateSchema.extend({
  id: z.string().nonempty(),
});
