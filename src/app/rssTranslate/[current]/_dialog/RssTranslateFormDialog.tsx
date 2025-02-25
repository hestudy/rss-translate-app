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
import RssTranslateForm from "../_form/RssTranslateForm";

const RssTranslateFormDialog = memo(
  ({
    children,
    ...props
  }: PropsWithChildren<Parameters<typeof RssTranslateForm>[0]>) => {
    const [open, openAc] = useBoolean(false);

    return (
      <Dialog open={open} onOpenChange={openAc.set}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create RssTranslate</DialogTitle>
          </DialogHeader>
          <RssTranslateForm
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

export default RssTranslateFormDialog;
