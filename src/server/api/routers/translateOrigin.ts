import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/server/db";
import { translateOrigin } from "~/server/db/schema";
import { authProcedure, createTRPCRouter } from "../trpc";

export const translateOriginRouter = createTRPCRouter({
  create: authProcedure
    .input(
      z.object({
        name: z.string().nonempty(),
        baseUrl: z.string().optional(),
        apiKey: z.string().nonempty(),
        model: z.string().nonempty(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await db.insert(translateOrigin).values({
        ...input,
        createdById: ctx.session.user.id,
      });
    }),
  list: authProcedure.query(async () => {
    const result = await db.query.translateOrigin.findMany();
    return result.map((d) => {
      const { apiKey, baseUrl, ...props } = d;
      return props;
    });
  }),
  edit: authProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
        name: z.string().nonempty(),
        baseUrl: z.string().optional(),
        apiKey: z.string().nonempty(),
        model: z.string().nonempty(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...props } = input;
      return await db
        .update(translateOrigin)
        .set(props)
        .where(eq(translateOrigin.id, id));
    }),
  delete: authProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
      }),
    )
    .mutation(async ({ input }) => {
      return await db
        .delete(translateOrigin)
        .where(eq(translateOrigin.id, input.id));
    }),
  info: authProcedure
    .input(
      z.object({
        id: z.string().nonempty(),
      }),
    )
    .query(async ({ input }) => {
      return await db.query.translateOrigin.findFirst({
        where: eq(translateOrigin.id, input.id),
      });
    }),
});
