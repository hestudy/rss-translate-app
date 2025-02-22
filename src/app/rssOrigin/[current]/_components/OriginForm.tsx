"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FloatSpin from "~/app/_components/FloatSpin";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { addRssOriginZObject } from "~/server/api/schema/rssOrigin";
import { api } from "~/trpc/react";

const OriginForm = memo((props: { onOk?: () => void; id?: string }) => {
  const form = useForm<z.infer<typeof addRssOriginZObject>>({
    defaultValues: {
      name: "",
      link: "",
    },
    resolver: zodResolver(addRssOriginZObject),
    mode: "onChange",
  });

  const query = api.rssOrigin.info.useQuery(
    { id: props.id! },
    { enabled: !!props.id },
  );

  useEffect(() => {
    if (query.data) {
      // @ts-ignore
      form.reset(query.data);
    }
  }, [query.data]);

  const mutation = api.rssOrigin.add.useMutation();

  const editMutation = api.rssOrigin.edit.useMutation();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          if (!props.id) {
            await mutation.mutateAsync(values);
          } else {
            await editMutation.mutateAsync({
              id: props.id,
              ...values,
            });
            query.refetch();
          }
          props.onOk?.();
        })}
        className="relative space-y-8"
      >
        {query.isLoading && <FloatSpin />}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        ></FormField>
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Link</FormLabel>
                <FormControl>
                  <Input placeholder="Link" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        ></FormField>
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
});

export default OriginForm;
