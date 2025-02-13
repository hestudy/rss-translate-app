import { z } from "zod";

export const addRssOriginZObject = z.object({
  name: z.string(),
  link: z.string().url(),
});
