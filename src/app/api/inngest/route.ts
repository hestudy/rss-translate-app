import { serve } from "inngest/next";
import { inngest } from "~/inngest/client";
import { fetchRssAndSaveRss } from "~/inngest/functions/fetchRssAndSaveRss";
import { translateRss } from "~/inngest/functions/translateRss";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [fetchRssAndSaveRss, translateRss],
});
