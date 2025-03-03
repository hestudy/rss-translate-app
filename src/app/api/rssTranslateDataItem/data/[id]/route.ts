import { eq } from "drizzle-orm";
import { type NextRequest } from "next/server";
import { db } from "~/server/db";
import { rssTranslateDataItem } from "~/server/db/schema";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const id = (await params).id;
  const record = await db.query.rssTranslateDataItem.findFirst({
    where: eq(rssTranslateDataItem.id, id),
  });

  return Response.json(record?.data);
};
