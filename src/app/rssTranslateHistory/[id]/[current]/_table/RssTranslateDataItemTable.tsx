"use client";

import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Trash } from "lucide-react";
import Link from "next/link";
import { memo, useMemo } from "react";
import { toast } from "sonner";
import ConfirmPopover from "~/app/_components/confirmPopover";
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
  const query = api.rssTranslateDataItem.list.useQuery(
    {
      id,
    },
    {
      staleTime: 0,
    },
  );

  const deleteMutation = api.rssTranslateDataItem.delete.useMutation();

  const columns = useMemo(
    () => [
      columnHelper.accessor("jobId", {
        header: "JobId",
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
      columnHelper.display({
        id: "action",
        header: "Action",
        cell(props) {
          return (
            <div className="flex space-x-2">
              <ConfirmPopover
                title="Confirm Delete?"
                onConfirm={async () => {
                  await deleteMutation.mutateAsync({
                    id: props.row.original.id,
                  });
                  toast.success("Delete Success");
                  await query.refetch();
                }}
              >
                <Button size={"icon"} variant={"ghost"}>
                  <Trash className="text-red-500" />
                </Button>
              </ConfirmPopover>
            </div>
          );
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
