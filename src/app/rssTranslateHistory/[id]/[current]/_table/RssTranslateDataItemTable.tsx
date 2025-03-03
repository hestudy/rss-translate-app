"use client";

import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";
import Link from "next/link";
import { memo, useMemo } from "react";
import { DataTable } from "~/app/_components/DataTable";
import FloatSpin from "~/app/_components/FloatSpin";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { type api as sapi } from "~/trpc/server";

const columnHelper =
  createColumnHelper<
    Awaited<ReturnType<typeof sapi.rssTranslateDataItem.list>>[0]
  >();

const RssTranslateDataItemTable = memo(({ id }: { id: string }) => {
  const query = api.rssTranslateDataItem.list.useQuery({
    id,
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor("jobId", {
        header: "JobId",
      }),
      columnHelper.accessor("jobState", {
        header: "JobState",
      }),
      columnHelper.accessor("origin", {
        header: "Origin",
        cell(props) {
          return (
            <Link
              href={`/api/rssTranslateDataItem/origin/${props.row.original.id}`}
              target="_blank"
            >
              <Button variant={"link"} size={"icon"}>
                Click View
              </Button>
            </Link>
          );
        },
      }),
      columnHelper.accessor("data", {
        header: "Data",
        cell(props) {
          return (
            <Link
              href={`/api/rssTranslateDataItem/data/${props.row.original.id}`}
              target="_blank"
            >
              <Button variant={"link"} size={"icon"}>
                Click View
              </Button>
            </Link>
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "CreatedAt",
        cell(props) {
          return dayjs(props.getValue()).format("YYYY-MM-DD HH:mm:ss");
        },
      }),
    ],
    [],
  );

  return (
    <div className="relative">
      {query.isPending && <FloatSpin />}
      <DataTable data={query.data ?? []} columns={columns} />
    </div>
  );
});

export default RssTranslateDataItemTable;
