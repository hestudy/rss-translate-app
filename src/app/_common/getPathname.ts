import { headers } from "next/headers";

export const getPathname = async () => {
  const headersList = headers();
  return (await headersList).get("x-pathname");
};
