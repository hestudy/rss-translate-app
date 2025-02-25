"use client";

import { useBoolean } from "ahooks";
import { memo, type PropsWithChildren } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import TranslateOriginForm from "../_form/TranslateOriginForm";
import { revalidatePath } from "next/cache";

const TranslateOriginFormDialog = memo(
  ({
    children,
    ...props
  }: PropsWithChildren<Parameters<typeof TranslateOriginForm>[0]>) => {
    const [open, openAc] = useBoolean(false);

    return (
      <Dialog open={open} onOpenChange={openAc.set}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Translate Origin</DialogTitle>
          </DialogHeader>
          <TranslateOriginForm
            {...props}
            onOk={() => {
              openAc.setFalse();
              props.onOk?.();
            }}
          />
        </DialogContent>
      </Dialog>
    );
  },
);

export default TranslateOriginFormDialog;
