"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import ConfirmPopover from "~/app/_components/confirmPopover";
import { DataTable } from "~/app/_components/DataTable";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { api as sapi } from "~/trpc/server";

export default function RssTranslateTable(props: {
  data: any;
  onOk?: () => void;
}) {
  const deleteMutatio = api.rssTranslate.delete.useMutation();

  const columns = useMemo<
    ColumnDef<Awaited<ReturnType<typeof sapi.rssTranslate.page>>["list"][0]>[]
  >(() => {
    return [
      {
        accessorKey: "rssOrigin.name",
        header: "RssOrigin",
      },
      {
        accessorKey: "translateOrigin.name",
        header: "TranslateOrigin",
      },
      {
        accessorKey: "translatePrompt.name",
        header: "TranslatePrompt",
      },
      {
        id: "action",
        header: "Action",
        cell(cellProps) {
          return (
            <div>
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
      },
    ];
  }, [props.onOk]);

  return <DataTable columns={columns} data={props.data} />;
}
