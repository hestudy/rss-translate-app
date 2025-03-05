import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { z } from "zod";
import { inngest } from "../client";

const schema = z.object({
  content: z.string().nonempty(),
});

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
    const validate = schema.safeParse(event.data);
    if (validate.success) {
      const output = await splitter.createDocuments([
        validate.data.content ?? "",
      ]);
      return output;
    }
  },
);
