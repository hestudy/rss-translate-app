import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { textSplit } from "./textSplit";

export const translate = async (props: {
  prompt: string;
  baseUrl?: string;
  model: string;
  apiKey: string;
  content?: string;
  language: string;
}) => {
  if (!props.content) {
    return "";
  }
  const model = new ChatOpenAI({
    model: props.model,
    configuration: {
      baseURL: props.baseUrl,
      apiKey: props.apiKey,
    },
  });
  const split = await textSplit(props.content);
  const promptTemplate = PromptTemplate.fromTemplate(props.prompt);
  const translateList: string[] = [];
  for (const item of split) {
    console.log("content:", item.pageContent);
    const prompt = await promptTemplate.invoke({
      content: item.pageContent,
      language: props.language,
    });
    console.log("prompt:", prompt);
    const res = await model.invoke(prompt);
    if (res.content) {
      console.log("translateContent:", res.content.toString());
      translateList.push(res.content.toString());
    }
  }
  return translateList.join("\n");
};
