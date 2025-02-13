"use client";

import dayjs from "dayjs";
import { isEmpty } from "lodash";
import { Button } from "~/components/ui/button";
import { Pagination, PaginationContent } from "~/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import OriginFormDialog from "./_components/OriginFormDialog";

export default async function page({
  params,
}: {
  params: Promise<{
    current: string;
  }>;
}) {
  const query = api.rssOrigin.page.useQuery({
    current: Number((await params).current),
    pageSize: 10,
  });

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-end space-x-4">
        <OriginFormDialog>
          <Button>Add Origin</Button>
        </OriginFormDialog>
      </div>
      <div className="h-0 flex-1">
        <Table>
          {isEmpty(query.data?.list) && <TableCaption>No Data</TableCaption>}
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data?.list.map((item) => {
              return (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.link}</TableCell>
                  <TableCell>
                    {dayjs(item.createdAt).format("YYYY-MM-DD")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
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
