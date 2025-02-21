import { ceil } from "lodash";
import { revalidatePath } from "next/cache";
import { getPathname } from "~/app/_common/getPathname";
import { Button } from "~/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "~/components/ui/pagination";
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
            revalidatePath(pathname || "");
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
            revalidatePath(pathname || "");
          }}
        />
      </div>
      <div>
        <Pagination>
          <PaginationContent>
            {Array.from({ length: ceil(query.total / 10) }).map((_, index) => {
              return (
                <PaginationItem key={index}>
                  <PaginationLink
                    href={`/rssTranslate/${index + 1}`}
                    isActive={index + 1 === Number(current)}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
