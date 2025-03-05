"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Edit, History, Pause, Play, Rss, Trash } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { toast } from "sonner";
import ConfirmPopover from "~/app/_components/confirmPopover";
import { DataTable } from "~/app/_components/DataTable";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { type api as sapi } from "~/trpc/server";
import RssTranslateFormDialog from "../_dialog/RssTranslateFormDialog";

const columnHelper =
  createColumnHelper<
    Awaited<ReturnType<typeof sapi.rssTranslate.page>>["list"][0]
  >();

export default function RssTranslateTable(props: {
  data: any;
  onOk?: () => void;
}) {
  const deleteMutation = api.rssTranslate.delete.useMutation();
  const enableMutation = api.rssTranslate.enable.useMutation();
  const disableMutation = api.rssTranslate.disable.useMutation();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("rssOriginData.name", {
        header: "RssOrigin",
      }),
      columnHelper.accessor("translateOriginData.name", {
        header: "TranslateOrigin",
      }),
      columnHelper.accessor("translatePromptData.name", {
        header: "TranslatePrompt",
      }),
      columnHelper.accessor("language", {
        header: "TranslateLanguage",
      }),
      columnHelper.accessor("scrapyFull", {
        header: "ScrapyFull",
      }),
      columnHelper.display({
        id: "action",
        header: "Action",
        cell(cellProps) {
          return (
            <div>
              <Link
                target="_blank"
                href={`/api/rss/${cellProps.row.original.id}`}
              >
                <Button variant={"ghost"} size={"icon"}>
                  <Rss />
                </Button>
              </Link>
              {cellProps.row.original.enabled && (
                <ConfirmPopover
                  title="Confirm Pause?"
                  onConfirm={async () => {
                    await disableMutation.mutateAsync({
                      id: cellProps.row.original.id,
                    });
                    toast.success("Pause RssTranslate Success");
                    props.onOk?.();
                  }}
                >
                  <Button size={"icon"} variant={"link"}>
                    <Pause />
                  </Button>
                </ConfirmPopover>
              )}
              {!cellProps.row.original.enabled && (
                <ConfirmPopover
                  title="Confirm Enable?"
                  onConfirm={async () => {
                    await enableMutation.mutateAsync({
                      id: cellProps.row.original.id,
                    });
                    toast.success("Enable RssTranslate Success");
                    props.onOk?.();
                  }}
                >
                  <Button size={"icon"} variant={"link"}>
                    <Play />
                  </Button>
                </ConfirmPopover>
              )}
              <Link
                href={`/rssTranslateHistory/${cellProps.row.original.id}/1`}
              >
                <Button size={"icon"} variant={"link"}>
                  <History />
                </Button>
              </Link>
              <RssTranslateFormDialog
                id={cellProps.row.original.id}
                onOk={props.onOk}
              >
                <Button variant={"ghost"} size={"icon"}>
                  <Edit />
                </Button>
              </RssTranslateFormDialog>
              <ConfirmPopover
                title="Delete RssTranslate?"
                onConfirm={async () => {
                  await deleteMutation.mutateAsync({
                    id: cellProps.row.original.id,
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
