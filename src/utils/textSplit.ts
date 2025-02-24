import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const textSplit = async (content: string) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 1,
  });

  const output = await splitter.createDocuments([content]);
  return output;
};
