import { Trash } from "lucide-react";
import { revalidatePath } from "next/cache";
import { memo } from "react";
import { getPathname } from "~/app/_common/getPathname";
import ConfirmPopover from "~/app/_components/confirmPopover";
import SPagination from "~/app/_components/SPagination";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";
import RssTanslateHistoryTable from "./_table/RssTanslateHistoryTable";

const page = memo(
  async ({ params }: { params: Promise<{ current: string; id: string }> }) => {
    const pathname = await getPathname();
    const { current, id } = await params;

    const { list, total } = await api.rssTranslateData.page({
      current: Number(current),
      pageSize: 10,
      rssTranslateId: id,
    });

    return (
      <div className="flex h-full flex-col space-y-2">
        <div className="flex justify-end">
          <ConfirmPopover
            title="Confirm Clear Data?"
            onConfirm={async () => {
              "use server";
              await api.rssTranslate.clear({
                id,
              });
              revalidatePath(pathname ?? "");
            }}
          >
            <Button variant={"destructive"}>
              <Trash />
              Clear
            </Button>
          </ConfirmPopover>
        </div>
        <div className="h-0 flex-1 overflow-y-auto">
          <RssTanslateHistoryTable
            data={list}
            onOk={async () => {
              "use server";
              revalidatePath(pathname ?? "");
            }}
          />
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
