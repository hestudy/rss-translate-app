import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { inngest } from "../client";
import { textSplit } from "./textSplit";

const schema = z.object({
  prompt: z.string().nonempty(),
  baseUrl: z.string().optional(),
  model: z.string().nonempty(),
  apiKey: z.string().nonempty(),
  content: z.string().optional(),
  language: z.string().nonempty(),
});

export const translate = inngest.createFunction(
  {
    id: "translate",
  },
  { event: "text/translate" },
  async ({ event, step }) => {
    const validate = schema.safeParse(event.data);
    if (validate.success) {
      if (!validate.data.content) {
        return "";
      }

      const model = new ChatOpenAI({
        model: validate.data.model,
        configuration: {
          baseURL: validate.data.baseUrl,
          apiKey: validate.data.apiKey,
        },
      });

      const textSplitList = await step.invoke("text-split", {
        function: textSplit,
        data: {
          content: validate.data.content,
        },
      });

      const promptTemplate = PromptTemplate.fromTemplate(validate.data.prompt);

      const translateList: string[] = [];
      for (const item of textSplitList) {
        const prompt = await step.run("create prompt template", async () => {
          return (
            await promptTemplate.invoke({
              content: item.pageContent,
              language: validate.data.language,
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
    }
  },
);
