import { memo, PropsWithChildren } from "react";
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
    return (
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Origin</DialogTitle>
          </DialogHeader>
          <OriginForm {...props} />
        </DialogContent>
      </Dialog>
    );
  },
);

export default OriginFormDialog;
