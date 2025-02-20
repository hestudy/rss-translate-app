"use client";

import dayjs from "dayjs";
import { isEmpty } from "lodash";
import { Edit, Trash } from "lucide-react";
import { memo } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/react";
import ConfirmPopover from "../_components/confirmPopover";
import Empty from "../_components/Empty";
import Spin from "../_components/Spin";
import TranslateOriginFormDialog from "./_dialog/TranslateOriginFormDialog";

const page = memo(() => {
  const query = api.translateOrigin.list.useQuery();

  const deleteMutation = api.translateOrigin.delete.useMutation();

  return (
    <div className="flex h-full flex-col space-y-2">
      <div className="flex justify-end">
        <TranslateOriginFormDialog onOk={query.refetch}>
          <Button>Create</Button>
        </TranslateOriginFormDialog>
      </div>
      <div className="relative h-0 flex-1">
        {query.isPending && <Spin />}
        {isEmpty(query.data) && <Empty />}
        <div className="grid h-full grid-cols-4 gap-4 overflow-y-auto">
          {query.data?.map((item, index) => {
            return (
              <div key={item.id}>
                <Card className="group relative">
                  <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100">
                    <TranslateOriginFormDialog
                      id={item.id}
                      onOk={query.refetch}
                    >
                      <Button size={"icon"} variant={"ghost"}>
                        <Edit />
                      </Button>
                    </TranslateOriginFormDialog>
                    <ConfirmPopover
                      title="Delete Translate Origin?"
                      onConfirm={async () => {
                        await deleteMutation.mutateAsync({
                          id: item.id,
                        });
                        query.refetch();
                      }}
                    >
                      <Button
                        size={"icon"}
                        variant={"ghost"}
                        className="text-red-500"
                      >
                        <Trash />
                      </Button>
                    </ConfirmPopover>
                  </div>
                  <CardHeader>
                    <CardTitle>
                      #{index + 1} {item.name}
                    </CardTitle>
                    <CardDescription>
                      <div>Model: {item.model}</div>
                      <div>
                        CreatedAt:{" "}
                        {dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default page;
