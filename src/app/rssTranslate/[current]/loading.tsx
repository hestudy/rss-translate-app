import { memo } from "react";
import FloatSpin from "~/app/_components/FloatSpin";

const loading = memo(() => {
  return (
    <div className="relative h-full">
      <FloatSpin />
    </div>
  );
});

export default loading;
