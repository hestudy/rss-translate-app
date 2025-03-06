import markdownIt from "markdown-it";
import { inngest } from "../client";

const md = markdownIt();

export const mdToHtml = inngest.createFunction(
  { id: "md-to-html" },
  {
    event: "md/to-html",
  },
  async ({ event }) => {
    return md.render(event.data.content);
  },
);
