"use client";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import { Edit, History, Play, Trash } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import FloatSpin from "~/app/_components/FloatSpin";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { initData } from "../_common/values";
import ConfirmPopover from "../_components/confirmPopover";
import HPagination from "../_components/HPagination";
import HTable from "../_components/HTable";
import { usePaginationState } from "../_hooks/usePaginationState";
import HistoryDataSheet from "./_components/HistoryDataSheet";
import OriginFormDialog from "./_components/OriginFormDialog";

const columnHelper = createColumnHelper<{
  id: string;
  name: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date | null;
  link: string;
  jobId: string | null;
  jobStatus: string | null;
}>();
export default function page() {
  const { current, pageSize } = usePaginationState();
  const query = api.rssOrigin.page.useQuery({
    current,
    pageSize,
  });

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
        cell(props) {
          const id = props.row.original.id;
          return (
            <div className="space-x-2">
              <ConfirmPopover
                title="Confirm Run?"
                onConfirm={async () => {
                  await runMutation.mutateAsync({
                    id,
                  });
                  query.refetch();
                }}
              >
                <Button size={"icon"} variant={"link"}>
                  <Play />
                </Button>
              </ConfirmPopover>
              <HistoryDataSheet id={id}>
                <Button size={"icon"} variant={"link"}>
                  <History />
                </Button>
              </HistoryDataSheet>
              <OriginFormDialog
                id={id}
                onOk={() => {
                  toast.success("Update Origin Success");
                  query.refetch();
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
                  query.refetch();
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

  const table = useReactTable({
    data: query.data?.list || initData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-end space-x-4">
        <OriginFormDialog
          onOk={() => {
            toast.success("Add Origin Success");
            query.refetch();
          }}
        >
          <Button>Add Origin</Button>
        </OriginFormDialog>
      </div>
      <div className="relative h-0 flex-1 overflow-y-auto">
        {query.isPending && <FloatSpin />}
        <HTable {...table} />
      </div>
      <div className="flex justify-end">
        <HPagination
          current={current}
          pageSize={pageSize}
          total={query.data?.total}
        />
      </div>
    </div>
  );
}
