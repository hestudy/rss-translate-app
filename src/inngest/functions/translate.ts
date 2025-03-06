import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { inngest } from "../client";
import { textSplit } from "./textSplit";

export const translate = inngest.createFunction(
  {
    id: "translate",
  },
  { event: "text/translate" },
  async ({ event, step }) => {
    if (!event.data.content) {
      return "";
    }

    const model = new ChatOpenAI({
      model: event.data.model,
      configuration: {
        baseURL: event.data.baseUrl,
        apiKey: event.data.apiKey,
      },
    });

    const textSplitList = await step.invoke("text-split", {
      function: textSplit,
      data: {
        content: event.data.content,
      },
    });

    const promptTemplate = PromptTemplate.fromTemplate(event.data.prompt);

    const translateList: string[] = [];
    for (const item of textSplitList) {
      const prompt = await step.run("create prompt template", async () => {
        return (
          await promptTemplate.invoke({
            content: item.pageContent,
            language: event.data.language,
          })
        ).toString();
      });

      const content = await step.run("use prompt translate", async () => {
        return (await model.invoke(prompt)).content.toString();
      });

      if (content) {
        translateList.push(content);
      }
    }
    return translateList.join("\n\n");
  },
);
