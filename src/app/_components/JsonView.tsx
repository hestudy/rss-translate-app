"use client";

import { memo } from "react";
import ReactJson from "react-json-view";

const JsonView = memo(({ json }: { json: any }) => {
  return <ReactJson src={json} />;
});

export default JsonView;
