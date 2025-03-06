import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { inngest } from "../client";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 2000,
  chunkOverlap: 1,
});

export const textSplit = inngest.createFunction(
  {
    id: "text-split",
  },
  { event: "text/split" },
  async ({ event }) => {
    const output = await splitter.createDocuments([event.data.content]);
    return output;
  },
);
