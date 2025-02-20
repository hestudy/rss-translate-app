"use client";

import { useBoolean } from "ahooks";
import { memo, PropsWithChildren } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import TranslatePromptForm from "../_form/TranslatePromptForm";

const TranslatePromptFormDialog = memo(
  ({
    children,
    ...props
  }: PropsWithChildren<Parameters<typeof TranslatePromptForm>[0]>) => {
    const [open, openAc] = useBoolean(false);

    return (
      <Dialog open={open} onOpenChange={openAc.set}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Translate Prompt</DialogTitle>
          </DialogHeader>
          <TranslatePromptForm
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

export default TranslatePromptFormDialog;
