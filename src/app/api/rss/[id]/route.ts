import dayjs from "dayjs";
import { eq, isNotNull } from "drizzle-orm";
import { uniqBy } from "lodash";
import { type NextRequest } from "next/server";
import Rss from "rss";
import type Parser from "rss-parser";
import { db } from "~/server/db";
import {
  rssTranslate,
  rssTranslateData,
  rssTranslateDataItem,
} from "~/server/db/schema";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const id = (await params).id;
  const record = await db.query.rssTranslate.findFirst({
    where: eq(rssTranslate.id, id),
    with: {
      rssTranslateData: {
        with: {
          rssTranslateDataItem: {
            where: isNotNull(rssTranslateDataItem.data),
          },
        },
        where: isNotNull(rssTranslateData.feed),
      },
    },
  });

  if (!record) {
    return new Response("Not found", { status: 404 });
  }
  // const record = await api.rssTranslateData.lastActive({ id });
  const data = record.rssTranslateData.at(0)?.feed as Parser.Output<any>;
  const feed = new Rss({
    title: data.title!,
    feed_url: data.feedUrl!,
    site_url: data.link!,
  });
  const list: (typeof rssTranslateDataItem.$inferSelect)[] = [];
  record.rssTranslateData.forEach((d) => {
    d.rssTranslateDataItem.forEach((dd) => {
      list.push(dd);
    });
  });
  uniqBy(list, "link")
    .sort((a, b) => {
      const aItem = a.data as Parser.Item | undefined;
      const bItem = b.data as Parser.Item | undefined;
      return dayjs(aItem?.pubDate).unix() - dayjs(bItem?.pubDate).unix();
    })
    .forEach((d) => {
      const item = d.data as Parser.Item | undefined;
      if (item) {
        feed.item({
          date: item.pubDate ?? "",
          description: item.content ?? "",
          title: item.title ?? "",
          url: item.link ?? "",
        });
      }
    });

  const headers = new Headers();

  headers.append("Content-Type", "text/xml");

  return new Response(feed.xml(), {
    headers,
  });
};
