import { type NextRequest } from "next/server";
import Rss from "rss";
import type Parser from "rss-parser";
import { api } from "~/trpc/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const id = (await params).id;
  const record = await api.rssTranslateData.lastActive({ id });
  const data = record.at(0)?.rssTranslateData?.feed as Parser.Output<any>;
  const feed = new Rss({
    title: data.title!,
    feed_url: data.feedUrl!,
    site_url: data.link!,
  });
  record.forEach((d) => {
    const item = d.rssTranslateDataItem?.data as Parser.Item | undefined;
    feed.item({
      date: item?.pubDate ?? "",
      description: item?.content ?? "",
      title: item?.title ?? "",
      url: item?.link ?? "",
    });
  });

  const headers = new Headers();

  headers.append("Content-Type", "text/xml");

  return new Response(feed.xml(), {
    headers,
  });
};
