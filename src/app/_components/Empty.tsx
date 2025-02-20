import React, { memo } from "react";

const Empty = memo(() => {
  return (
    <div className="flex h-full w-full items-center justify-center text-xl text-muted-foreground">
      No Result
    </div>
  );
});

export default Empty;
