import { revalidatePath } from "next/cache";
import { getPathname } from "~/app/_common/getPathname";
import SPagination from "~/app/_components/SPagination";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";
import OriginFormDialog from "./_components/OriginFormDialog";
import RssOriginTable from "./_table/rssOriginTable";

export default async function page({
  params,
}: {
  params: Promise<{ current: string }>;
}) {
  const current = (await params).current;
  const pathname = await getPathname();

  const query = await api.rssOrigin.page({
    current: Number(current),
    pageSize: 10,
  });

  return (
    <div className="spave-y-2 flex h-full flex-col">
      <div className="flex justify-end">
        <OriginFormDialog
          onOk={async () => {
            "use server";
            revalidatePath(pathname ?? "");
          }}
        >
          <Button>Create</Button>
        </OriginFormDialog>
      </div>
      <div className="h-0 flex-1">
        <RssOriginTable
          data={query.list}
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
          total={query.total ?? 0}
          href={(index) => `/rssOrigin/${index}`}
        />
      </div>
    </div>
  );
}
