import { serve } from "inngest/next";
import { inngest } from "~/inngest/client";
import { fetchFeed } from "~/inngest/functions/fetchFeed";
import { fetchRssAndSaveRss } from "~/inngest/functions/fetchRssAndSaveRss";
import { textSplit } from "~/inngest/functions/textSplit";
import { translate } from "~/inngest/functions/translate";
import { translateRss } from "~/inngest/functions/translateRss";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    fetchRssAndSaveRss,
    translateRss,
    textSplit,
    fetchFeed,
    translate,
  ],
});
