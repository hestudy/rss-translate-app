import { revalidatePath } from "next/cache";
import { getPathname } from "~/app/_common/getPathname";
import SPagination from "~/app/_components/SPagination";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";
import RssTranslateFormDialog from "./_dialog/RssTranslateFormDialog";
import RssTranslateTable from "./_table/table";

export default async function page({
  params,
}: {
  params: Promise<{ current: string }>;
}) {
  const pathname = await getPathname();
  const current = (await params).current;

  const query = await api.rssTranslate.page({
    current: Number(current),
    pageSize: 10,
  });

  return (
    <div className="flex h-full flex-col space-y-2">
      <div className="flex justify-end">
        <RssTranslateFormDialog
          onOk={async () => {
            "use server";
            revalidatePath(pathname ?? "");
          }}
        >
          <Button>Create</Button>
        </RssTranslateFormDialog>
      </div>
      <div className="h-0 flex-1">
        <RssTranslateTable
          data={query.list}
          onOk={async () => {
            "use server";
            revalidatePath(pathname ?? "");
          }}
        />
      </div>
      <div>
        <SPagination
          href={(index) => `/rssTranslate/${index}`}
          current={Number(current)}
          pageSize={10}
          total={query.total}
        />
      </div>
    </div>
  );
}
