import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import dayjs from "dayjs";
import { memo, useMemo } from "react";
import { initData } from "~/app/_common/values";
import FloatSpin from "~/app/_components/FloatSpin";
import HPagination from "~/app/_components/HPagination";
import HTable from "~/app/_components/HTable";
import JsonViewDialog from "~/app/_components/JsonViewDialog";
import { usePaginationState } from "~/app/_hooks/usePaginationState";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

const columnHelper = createColumnHelper<{
  id: string;
  data: unknown;
  createdById: string;
  createdAt: Date;
  updatedAt: Date | null;
  jobId: string | null;
  jobStatus: string | null;
  feed: unknown;
  rssTranslateId: string;
}>();

const HistoryData = memo(({ id }: { id: string }) => {
  const pagination = usePaginationState();

  const query = api.rssTranslateData.page.useQuery(
    {
      rssTranslateId: id,
      current: pagination.current,
      pageSize: pagination.pageSize,
    },
    {
      staleTime: 0,
    },
  );

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("jobId", {
        header: "JobId",
      }),
      columnHelper.accessor("data", {
        header: "Data",
        cell(props) {
          return (
            <JsonViewDialog json={props.getValue()}>
              <Button variant={"secondary"} size={"sm"}>
                Click to View
              </Button>
            </JsonViewDialog>
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "CreatedAt",
        cell(props) {
          return dayjs(props.getValue()).format("YYYY-MM-DD HH:mm:ss");
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
    <div className="flex h-full flex-col space-y-2">
      <div className="h-0 flex-1 overflow-y-auto">
        {query.isPending && <FloatSpin />}
        <HTable {...table} />
      </div>
      <div className="flex justify-end">
        <HPagination {...pagination} total={query.data?.total} />
      </div>
    </div>
  );
});

export default HistoryData;
