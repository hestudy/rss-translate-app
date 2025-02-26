import Parser from "rss-parser";

const parser = new Parser();

export const fetchFeed = async (url: string) => {
  return await parser.parseURL(url);
};
