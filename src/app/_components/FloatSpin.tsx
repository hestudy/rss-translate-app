import { Loader } from "lucide-react";
import React, { memo } from "react";
import Spin from "./Spin";

const FloatSpin = memo(() => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 bg-opacity-50">
      <Spin />
    </div>
  );
});

export default FloatSpin;
