"use client";

import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Plus, Trash, X } from "lucide-react";
import Link from "next/link";
import { memo, useMemo } from "react";
import { toast } from "sonner";
import ConfirmPopover from "~/app/_components/confirmPopover";
import { DataTable } from "~/app/_components/DataTable";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { type api as sapi } from "~/trpc/server";
import RssTranslateDataItemTable from "./RssTranslateDataItemTable";

const columnHelper =
  createColumnHelper<
    Awaited<ReturnType<typeof sapi.rssTranslateData.page>>["list"][0]
  >();

const RssTanslateHistoryTable = memo(
  ({ data, onOk }: { data: any; onOk?: () => void }) => {
    const deleteMutation = api.rssTranslateData.delete.useMutation();

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
                    onOk?.();
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
      <DataTable
        data={data}
        columns={columns}
        renderSubComponent={(row) => {
          return <RssTranslateDataItemTable id={(row.original as any)?.id} />;
        }}
      />
    );
  },
);

export default RssTanslateHistoryTable;
