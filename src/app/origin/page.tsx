"use client";

import dayjs from "dayjs";
import { isEmpty } from "lodash";
import { Edit, Play, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Spin from "~/app/_components/Spin";
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
import ConfirmPopover from "../_components/confirmPopover";
import OriginFormDialog from "./_components/OriginFormDialog";

export default function page() {
  const form = useForm({
    defaultValues: {
      current: 1,
      pageSize: 10,
    },
  });
  const query = api.rssOrigin.page.useQuery({
    current: form.watch("current"),
    pageSize: form.watch("pageSize"),
  });

  const deleteMutation = api.rssOrigin.delete.useMutation();

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
        {query.isPending && <Spin />}
        <Table>
          {isEmpty(query.data?.list) && <TableCaption>No Data</TableCaption>}
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[300px]">Link</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data?.list.map((item) => {
              return (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <a href={item.link} target="_blank">
                      <Button variant={"link"} className="p-0">
                        {item.link}
                      </Button>
                    </a>
                  </TableCell>
                  <TableCell>
                    {dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button size={"icon"} variant={"link"}>
                      <Play />
                    </Button>
                    <OriginFormDialog
                      id={item.id}
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
                          id: item.id,
                        });
                        toast.success("Delete Origin Success");
                        query.refetch();
                      }}
                    >
                      <Button
                        variant={"link"}
                        className="text-red-500"
                        size={"icon"}
                      >
                        <Trash />
                      </Button>
                    </ConfirmPopover>
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
