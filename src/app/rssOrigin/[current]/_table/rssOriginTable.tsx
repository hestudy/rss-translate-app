"use client";
import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Edit, Trash } from "lucide-react";
import { memo, useMemo } from "react";
import { toast } from "sonner";
import ConfirmPopover from "~/app/_components/confirmPopover";
import { DataTable } from "~/app/_components/DataTable";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { type api as sapi } from "~/trpc/server";
import OriginFormDialog from "../_components/OriginFormDialog";

const columnHelper =
  createColumnHelper<
    Awaited<ReturnType<typeof sapi.rssOrigin.page>>["list"][0]
  >();

const RssOriginTable = memo((props: { data: any; onOk?: () => void }) => {
  const deleteMutation = api.rssOrigin.delete.useMutation();
  const runMutation = api.rssOrigin.run.useMutation();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("name", {
        header: "Name",
      }),
      columnHelper.accessor("link", {
        header: "Link",
        cell(props) {
          return (
            <a href={props.getValue()} target="_blank">
              <Button variant={"link"} className="p-0">
                {props.getValue()}
              </Button>
            </a>
          );
        },
      }),
      columnHelper.accessor("jobStatus", {
        header: "JobStatus",
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
        cell(cellProps) {
          const id = cellProps.row.original.id;
          return (
            <div className="space-x-2">
              <OriginFormDialog
                id={id}
                onOk={() => {
                  toast.success("Update Origin Success");
                  props.onOk?.();
                }}
              >
                <Button size={"icon"} variant={"link"}>
                  <Edit />
                </Button>
              </OriginFormDialog>
              <ConfirmPopover
                title="Delete Origin?"
                onConfirm={async () => {
                  await deleteMutation.mutateAsync({
                    id,
                  });
                  toast.success("Delete Origin Success");
                  props.onOk?.();
                }}
              >
                <Button variant={"link"} className="text-red-500" size={"icon"}>
                  <Trash />
                </Button>
              </ConfirmPopover>
            </div>
          );
        },
      }),
    ];
  }, []);

  return <DataTable columns={columns as any} data={props.data} />;
});

export default RssOriginTable;
