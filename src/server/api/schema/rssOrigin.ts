import { z } from "zod";

export const addRssOriginZObject = z.object({
  name: z.string().nonempty(),
  link: z.string().url(),
});

export const editRssOriginZObject = addRssOriginZObject.extend({
  id: z.string().nonempty(),
});
