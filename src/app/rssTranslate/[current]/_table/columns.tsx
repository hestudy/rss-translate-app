"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import { revalidatePath } from "next/cache";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";

export const columns: ColumnDef<
  Awaited<ReturnType<typeof api.rssTranslate.page>>["list"][0]
>[] = [
  {
    accessorKey: "rssOrigin.name",
    header: "RssOrigin",
  },
  {
    accessorKey: "translateOrigin.name",
    header: "TranslateOrigin",
  },
  {
    accessorKey: "translatePrompt.name",
    header: "TranslatePrompt",
  },
  {
    id: "action",
    header: "Action",
    cell(props) {
      const pathname = usePathname();
      return (
        <div>
          <Button
            onClick={() => {
              revalidatePath(pathname);
            }}
            variant={"ghost"}
            size={"icon"}
            className="text-red-500"
          >
            <Trash />
          </Button>
        </div>
      );
    },
  },
];
