"use client";

import { memo, PropsWithChildren, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import OriginForm from "./OriginForm";

const OriginFormDialog = memo(
  ({
    children,
    ...props
  }: PropsWithChildren<Parameters<typeof OriginForm>[0]>) => {
    const [open, setOpen] = useState(false);
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Origin</DialogTitle>
          </DialogHeader>
          <OriginForm
            {...props}
            onOk={() => {
              setOpen(false);
              props.onOk?.();
            }}
          />
        </DialogContent>
      </Dialog>
    );
  },
);

export default OriginFormDialog;
