"use client";

import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Plus, X } from "lucide-react";
import Link from "next/link";
import { memo, useMemo } from "react";
import { DataTable } from "~/app/_components/DataTable";
import { Button } from "~/components/ui/button";
import { type api } from "~/trpc/server";
import RssTranslateDataItemTable from "./RssTranslateDataItemTable";

const columnHelper =
  createColumnHelper<
    Awaited<ReturnType<typeof api.rssTranslateData.page>>["list"][0]
  >();

const RssTanslateHistoryTable = memo(({ data }: { data: any }) => {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "expend",
        cell(props) {
          return (
            <Button
              size={"icon"}
              variant={"ghost"}
              onClick={props.row.getToggleExpandedHandler()}
            >
              {props.row.getIsExpanded() && <X className="size-4" />}
              {!props.row.getIsExpanded() && <Plus className="size-4" />}
            </Button>
          );
        },
      }),
      columnHelper.accessor("jobId", {
        header: "JobId",
      }),
      columnHelper.accessor("feed", {
        header: "Feed",
        cell(props) {
          return (
            <Link href={`/api/feed/${props.row.original.id}`} target="_blank">
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
    <DataTable
      data={data}
      columns={columns}
      renderSubComponent={(row) => {
        return <RssTranslateDataItemTable id={(row.original as any)?.id} />;
      }}
    />
  );
});

export default RssTanslateHistoryTable;
