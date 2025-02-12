import { Button } from "~/components/ui/button";
import { Pagination, PaginationContent } from "~/components/ui/pagination";
import { Table, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { api } from "~/trpc/server";

export default async function page({
  params,
}: {
  params: Promise<{
    current: string;
  }>;
}) {
  const { list, total } = await api.rssOrigin.page({
    current: Number((await params).current),
    pageSize: 10,
  });

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-end space-x-4">
        <Button>Add Origin</Button>
      </div>
      <div className="h-0 flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>
      <div className="flex justify-end">
        <Pagination>
          <PaginationContent></PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
