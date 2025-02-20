import { ceil } from "lodash";
import { memo, useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "~/components/ui/pagination";

const HPagination = memo(
  ({
    current = 1,
    pageSize = 10,
    total = 0,
    onChange,
  }: {
    current?: number;
    pageSize?: number;
    total?: number;
    onChange?: (current: number, pageSize: number) => void;
  }) => {
    const items = useMemo(() => {
      const count = ceil(total / pageSize);
      return Array.from({ length: count }).map((_, i) => i + 1);
    }, [pageSize, total]);

    return (
      <Pagination>
        <PaginationContent>
          {items.map((item) => {
            return (
              <PaginationItem key={item}>
                <PaginationLink
                  className="cursor-pointer"
                  isActive={item === current}
                  onClick={() => {
                    onChange?.(item, pageSize);
                  }}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            );
          })}
        </PaginationContent>
      </Pagination>
    );
  },
);

export default HPagination;
