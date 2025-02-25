"use client";

import { useRequest } from "ahooks";
import { memo, type PropsWithChildren, type ReactNode, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

const ConfirmPopover = memo(
  (
    props: PropsWithChildren<{
      title?: ReactNode;
      onCancel?: () => Promise<void> | void;
      onConfirm?: () => Promise<void> | void;
    }>,
  ) => {
    const [open, setOpen] = useState(false);

    const confirm = useRequest(
      async () => {
        await props.onConfirm?.();
        setOpen(false);
      },
      {
        manual: true,
      },
    );

    const cancel = useRequest(
      async () => {
        await props.onCancel?.();
        setOpen(false);
      },
      {
        manual: true,
      },
    );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{props.children}</PopoverTrigger>
        <PopoverContent className="space-y-2">
          <div className="text-lg font-semibold">{props.title}</div>
          <div className="flex justify-end space-x-2">
            <Button
              onClick={cancel.run}
              disabled={cancel.loading}
              size={"sm"}
              variant={"ghost"}
            >
              Cancel
            </Button>
            <Button
              onClick={confirm.run}
              disabled={confirm.loading}
              size={"sm"}
            >
              Confirm
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

export default ConfirmPopover;
