import { eq } from "drizzle-orm";
import { type NextRequest } from "next/server";
import Rss from "rss";
import type Parser from "rss-parser";
import { db } from "~/server/db";
import { rssTranslateData } from "~/server/db/schema";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const id = (await params).id;
  const record = await db.query.rssTranslateData.findFirst({
    where: eq(rssTranslateData.id, id),
  });
  const data = record?.feed as Parser.Output<any>;
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
