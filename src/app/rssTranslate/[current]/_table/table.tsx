"use client";

import { createColumnHelper } from "@tanstack/react-table";
import {
  Edit,
  FlaskConical,
  History,
  Pause,
  Play,
  Rss,
  Trash,
} from "lucide-react";
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
  const testMutation = api.rssTranslate.test.useMutation();
  const disabledMutation = api.rssTranslate.disabled.useMutation();
  const enabledMutation = api.rssTranslate.enabled.useMutation();

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
      columnHelper.accessor("rssTranslate.language", {
        header: "TranslateLanguage",
      }),
      columnHelper.accessor("rssTranslate.scrapyFull", {
        header: "ScrapyFull",
      }),
      columnHelper.accessor("rssTranslate.jobState", {
        header: "JobState",
      }),
      columnHelper.display({
        id: "action",
        header: "Action",
        cell(cellProps) {
          return (
            <div>
              <Link
                target="_blank"
                href={`/api/rss/${cellProps.row.original.rssTranslate.id}`}
              >
                <Button variant={"ghost"} size={"icon"}>
                  <Rss />
                </Button>
              </Link>
              {cellProps.row.original.rssTranslate.enabled && (
                <ConfirmPopover
                  title="Confirm Pause?"
                  onConfirm={async () => {
                    await disabledMutation.mutateAsync({
                      id: cellProps.row.original.rssTranslate.id,
                    });
                    toast.success("Pause RssTranslate Success");
                    props.onOk?.();
                  }}
                >
                  <Button variant={"ghost"} size={"icon"}>
                    <Pause />
                  </Button>
                </ConfirmPopover>
              )}
              {!cellProps.row.original.rssTranslate.enabled && (
                <ConfirmPopover
                  title="Confirm Play?"
                  onConfirm={async () => {
                    await enabledMutation.mutateAsync({
                      id: cellProps.row.original.rssTranslate.id,
                    });
                    toast.success("Play RssTranslate Success");
                    props.onOk?.();
                  }}
                >
                  <Button variant={"ghost"} size={"icon"}>
                    <Play />
                  </Button>
                </ConfirmPopover>
              )}
              <ConfirmPopover
                title="Confirm Run?"
                onConfirm={async () => {
                  await testMutation.mutateAsync({
                    id: cellProps.row.original.rssTranslate.id,
                  });
                  props.onOk?.();
                }}
              >
                <Button variant={"ghost"} size={"icon"}>
                  <FlaskConical />
                </Button>
              </ConfirmPopover>
              <Link
                href={`/rssTranslateHistory/${cellProps.row.original.rssTranslate.id}/1`}
              >
                <Button size={"icon"} variant={"link"}>
                  <History />
                </Button>
              </Link>
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
                  await deleteMutation.mutateAsync({
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
