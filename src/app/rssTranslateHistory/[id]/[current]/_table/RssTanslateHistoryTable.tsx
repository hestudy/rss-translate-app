"use client";

import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";
import { memo, useMemo } from "react";
import { DataTable } from "~/app/_components/DataTable";
import { Button } from "~/components/ui/button";
import { type api } from "~/trpc/server";

const columnHelper =
  createColumnHelper<
    Awaited<ReturnType<typeof api.rssTranslateData.page>>["list"][0]
  >();

const RssTanslateHistoryTable = memo(({ data }: { data: any }) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor("jobId", {
        header: "JobId",
      }),
      columnHelper.accessor("jobState", {
        header: "JobState",
      }),
      columnHelper.accessor("feed", {
        header: "Feed",
        cell(props) {
          return (
            <Button variant={"secondary"} size={"sm"}>
              Click View
            </Button>
          );
        },
      }),
      columnHelper.display({
        id: "item",
        header: "Item",
        cell(props) {
          return (
            <Button variant={"secondary"} size={"sm"}>
              Click View
            </Button>
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

  return <DataTable data={data} columns={columns} />;
});

export default RssTanslateHistoryTable;
