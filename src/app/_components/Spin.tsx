import { Loader } from "lucide-react";
import { memo } from "react";

const Spin = memo(() => {
  return <Loader className="animate-spin" />;
});

export default Spin;
