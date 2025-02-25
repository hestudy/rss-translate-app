import { useState } from "react";

export const usePaginationState = (props?: {
  defaultCurrent?: number;
  defaultPageSize?: number;
}) => {
  const [current, setCurrent] = useState(props?.defaultCurrent ?? 1);
  const [pageSize, setPageSize] = useState(props?.defaultPageSize ?? 10);
  return {
    current,
    pageSize,
    setCurrent,
    setPageSize,
    onChange: (page: number, pageSize: number) => {
      setCurrent(page);
      setPageSize(pageSize);
    },
  };
};
