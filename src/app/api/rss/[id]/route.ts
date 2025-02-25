import { type NextRequest } from "next/server";
import { api } from "~/trpc/server";
import Rss from "rss";
import type Parser from "rss-parser";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const id = (await params).id;
  const detail = await api.rssTranslateData.lastActive({ id });
  const data = detail?.data as Parser.Output<any>;
  const feed = new Rss({
    title: data.title!,
    feed_url: data.feedUrl!,
    site_url: data.link!,
  });
  data.items.forEach((item: Parser.Item) => {
    feed.item({
      date: item.pubDate!,
      description: item.content!,
      title: item.title!,
      url: item.link!,
    });
  });

  const headers = new Headers();

  headers.append("Content-Type", "text/xml");

  return new Response(feed.xml(), {
    headers,
  });
};
