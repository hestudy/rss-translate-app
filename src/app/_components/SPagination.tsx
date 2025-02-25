import { ceil } from "lodash";
import { memo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "~/components/ui/pagination";

const SPagination = memo(
  (props: {
    current: number;
    pageSize: number;
    total: number;
    href: (index: number) => string;
  }) => {
    return (
      <Pagination>
        <PaginationContent>
          {Array.from({ length: ceil(props.total / props.pageSize) }).map(
            (_, index) => {
              return (
                <PaginationItem key={index}>
                  <PaginationLink
                    href={props.href(index + 1)}
                    isActive={index + 1 === Number(props.current)}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              );
            },
          )}
        </PaginationContent>
      </Pagination>
    );
  },
);

SPagination.displayName = "SPagination";
export default SPagination;
