import dayjs from "dayjs";
import { isEmpty } from "lodash";
import { Edit, Trash } from "lucide-react";
import { revalidatePath } from "next/cache";
import { memo } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/server";
import { getPathname } from "../_common/getPathname";
import ConfirmPopover from "../_components/confirmPopover";
import Empty from "../_components/Empty";
import TranslateOriginFormDialog from "./_dialog/TranslateOriginFormDialog";

const page = memo(async () => {
  const list = await api.translateOrigin.list();
  const pathname = await getPathname();

  return (
    <div className="flex h-full flex-col space-y-2">
      <div className="flex justify-end">
        <TranslateOriginFormDialog
          onOk={async () => {
            "use server";
            revalidatePath(pathname ?? "");
          }}
        >
          <Button>Create</Button>
        </TranslateOriginFormDialog>
      </div>
      <div className="relative h-0 flex-1">
        {isEmpty(list) && <Empty />}
        <div className="grid h-full grid-cols-4 gap-4 overflow-y-auto">
          {list?.map((item, index) => {
            return (
              <div key={item.id}>
                <Card className="group relative">
                  <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100">
                    <TranslateOriginFormDialog
                      id={item.id}
                      onOk={async () => {
                        "use server";
                        revalidatePath(pathname ?? "");
                      }}
                    >
                      <Button size={"icon"} variant={"ghost"}>
                        <Edit />
                      </Button>
                    </TranslateOriginFormDialog>
                    <ConfirmPopover
                      title="Delete Translate Origin?"
                      onConfirm={async () => {
                        "use server";
                        await api.translateOrigin.delete({
                          id: item.id,
                        });
                        revalidatePath(pathname ?? "");
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
