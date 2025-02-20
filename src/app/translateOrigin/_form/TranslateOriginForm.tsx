"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Spin from "~/app/_components/Spin";
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
import { api } from "~/trpc/react";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().nonempty(),
  baseUrl: z.string().optional(),
  apiKey: z.string().nonempty(),
  model: z.string().nonempty(),
});

const TranslateOriginForm = memo(
  (props: { onOk?: () => void; id?: string }) => {
    const form = useForm<z.infer<typeof schema>>({
      resolver: zodResolver(schema),
      mode: "onChange",
      defaultValues: {
        name: "",
        baseUrl: "",
        apiKey: "",
        model: "",
        id: "",
      },
    });

    const mutation = api.translateOrigin.create.useMutation();
    const editMutation = api.translateOrigin.edit.useMutation();

    const info = api.translateOrigin.info.useQuery(
      {
        id: props.id!,
      },
      {
        enabled: !!props.id,
        staleTime: 0,
      },
    );

    useEffect(() => {
      if (info.data) {
        // @ts-ignore
        form.reset(info.data);
      }
    }, [info.data]);

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            if (props.id) {
              const res = await editMutation.mutateAsync({
                ...values,
                id: props.id,
              });
              if (res.error) {
                toast.error(res.error);
              } else {
                toast.success("Edit Success");
                props.onOk?.();
              }
            } else {
              const res = await mutation.mutateAsync(values);
              if (res.error) {
                toast.error(res.error);
              } else {
                toast.success("Create Success");
                props.onOk?.();
              }
            }
          })}
          className="relative space-y-2"
        >
          {info.isLoading && <Spin />}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>ApiKey</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="baseUrl"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>BaseUrl</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <div className="flex justify-end">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
    );
  },
);

export default TranslateOriginForm;
