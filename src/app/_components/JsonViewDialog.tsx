import { memo, type PropsWithChildren } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import JsonView from "./JsonView";

const JsonViewDialog = memo(
  ({
    children,
    ...props
  }: PropsWithChildren<Parameters<typeof JsonView>[0]>) => {
    return (
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="flex h-full flex-col sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Json View</DialogTitle>
          </DialogHeader>
          <div className="h-0 flex-1 overflow-y-auto">
            <JsonView {...props} />
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);

export default JsonViewDialog;
