import { memo, type PropsWithChildren } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import HistoryData from "./HistoryData";

const HistoryDataSheet = memo(
  ({
    children,
    ...props
  }: PropsWithChildren & Parameters<typeof HistoryData>[0]) => {
    return (
      <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="flex flex-col sm:max-w-[800px]">
          <SheetHeader>
            <SheetTitle>History</SheetTitle>
          </SheetHeader>
          <div className="h-0 flex-1">
            <HistoryData {...props} />
          </div>
        </SheetContent>
      </Sheet>
    );
  },
);

export default HistoryDataSheet;
