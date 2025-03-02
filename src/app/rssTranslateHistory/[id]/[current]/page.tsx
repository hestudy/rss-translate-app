import { memo } from "react";
import SPagination from "~/app/_components/SPagination";
import { api } from "~/trpc/server";
import RssTanslateHistoryTable from "./_table/RssTanslateHistoryTable";

const page = memo(
  async ({ params }: { params: Promise<{ current: string; id: string }> }) => {
    const { current, id } = await params;

    const { list, total } = await api.rssTranslateData.page({
      current: Number(current),
      pageSize: 10,
      rssTranslateId: id,
    });

    return (
      <div className="flex h-full flex-col space-y-2">
        <div className="h-0 flex-1">
          <RssTanslateHistoryTable data={list} />
        </div>
        <div>
          <SPagination
            current={Number(current)}
            pageSize={10}
            total={total ?? 0}
            href={(index) => `/rssTranslateHistory/${id}/${index}`}
          />
        </div>
      </div>
    );
  },
);

export default page;
