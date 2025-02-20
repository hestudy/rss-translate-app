import { isEmpty } from "lodash";
import { Edit, Trash } from "lucide-react";
import { revalidatePath } from "next/cache";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/server";
import ConfirmPopover from "../_components/confirmPopover";
import Empty from "../_components/Empty";
import TranslatePromptFormDialog from "./_dialog/TranslatePromptFormDialog";

export default async function page() {
  const list = await api.translatePrompt.list();

  return (
    <div className="flex h-full flex-col space-y-2">
      <div className="flex justify-end">
        <TranslatePromptFormDialog
          onOk={async () => {
            "use server";
            revalidatePath("/translatePrompt");
          }}
        >
          <Button>Create</Button>
        </TranslatePromptFormDialog>
      </div>
      <div className="h-0 flex-1">
        {isEmpty(list) && <Empty />}
        <div className="grid grid-cols-4">
          {list.map((item, index) => {
            return (
              <div key={item.id}>
                <Card className="group relative">
                  <div className="z-1 absolute right-0 top-0 opacity-0 group-hover:opacity-100">
                    <TranslatePromptFormDialog
                      id={item.id}
                      onOk={async () => {
                        "use server";
                        revalidatePath("/translatePrompt");
                      }}
                    >
                      <Button variant={"ghost"} size={"icon"}>
                        <Edit />
                      </Button>
                    </TranslatePromptFormDialog>
                    <ConfirmPopover
                      title="Delete Prompt?"
                      onConfirm={async () => {
                        "use server";
                        await api.translatePrompt.delete({
                          id: item.id,
                        });
                        toast.success("Delete Prompt Success");
                        revalidatePath("/translatePrompt");
                      }}
                    >
                      <Button
                        variant={"ghost"}
                        size={"icon"}
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
                    <CardDescription className="whitespace-pre-line">
                      {item.prompt}
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
}
