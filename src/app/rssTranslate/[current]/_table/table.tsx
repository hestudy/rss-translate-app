"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Edit, Play, Trash } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import ConfirmPopover from "~/app/_components/confirmPopover";
import { DataTable } from "~/app/_components/DataTable";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { api as sapi } from "~/trpc/server";
import RssTranslateFormDialog from "../_dialog/RssTranslateFormDialog";

const columnHelper =
  createColumnHelper<
    Awaited<ReturnType<typeof sapi.rssTranslate.page>>["list"][0]
  >();

export default function RssTranslateTable(props: {
  data: any;
  onOk?: () => void;
}) {
  const deleteMutatio = api.rssTranslate.delete.useMutation();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("rssOrigin.name", {
        header: "RssOrigin",
      }),
      columnHelper.accessor("translateOrigin.name", {
        header: "TranslateOrigin",
      }),
      columnHelper.accessor("translatePrompt.name", {
        header: "TranslatePrompt",
      }),
      columnHelper.accessor("rssTranslate.jobStatus", {
        header: "JobState",
      }),
      columnHelper.display({
        id: "action",
        header: "Action",
        cell(cellProps) {
          return (
            <div>
              <Button variant={"ghost"} size={"icon"}>
                <Play />
              </Button>
              <RssTranslateFormDialog
                id={cellProps.row.original.rssTranslate.id}
                onOk={props.onOk}
              >
                <Button variant={"ghost"} size={"icon"}>
                  <Edit />
                </Button>
              </RssTranslateFormDialog>
              <ConfirmPopover
                title="Delete RssTranslate?"
                onConfirm={async () => {
                  await deleteMutatio.mutateAsync({
                    id: cellProps.row.original.rssTranslate.id,
                  });
                  toast.success("Delete RssTranslate Success");
                  props.onOk?.();
                }}
              >
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  className="text-red-500"
                >
                  <Trash />
                </Button>
              </ConfirmPopover>
            </div>
          );
        },
      }),
    ];
  }, [props.onOk]);

  return <DataTable columns={columns} data={props.data} />;
}
