"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import FloatSpin from "~/app/_components/FloatSpin";
import Select from "~/app/_components/Select";
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
  rssOrigin: z.string().nonempty(),
  translateOrigin: z.string().nonempty(),
  translatePrompt: z.string().nonempty(),
  language: z.string().nonempty(),
  id: z.string().optional(),
});

const RssTranslateForm = memo((props: { onOk?: () => void; id?: string }) => {
  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      language: "",
    },
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const mutation = api.rssTranslate.create.useMutation();
  const updateMutation = api.rssTranslate.update.useMutation();

  const query = api.rssTranslate.info.useQuery(
    {
      id: props.id!,
    },
    {
      enabled: !!props.id,
      staleTime: 0,
    },
  );

  useEffect(() => {
    if (query.data) {
      form.reset(query.data);
    }
  }, [query.data]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          if (!props.id) {
            await mutation.mutateAsync(values);
            toast.success("Create RssTranslate Success");
          } else {
            await updateMutation.mutateAsync({
              ...values,
              id: props.id,
            });
            toast.success("Update RssTranslate Success");
          }
          props.onOk?.();
        })}
        className="relative space-y-2"
      >
        {query.isLoading && <FloatSpin />}
        <FormField
          control={form.control}
          name="rssOrigin"
          render={({ field }) => {
            const query = api.rssOrigin.list.useQuery();

            return (
              <FormItem>
                <FormLabel>Rss Origin</FormLabel>
                <FormControl>
                  <div>
                    <Select
                      {...field}
                      loading={query.isPending}
                      options={query.data?.map((d) => {
                        return {
                          label: d.name,
                          value: d.id,
                        };
                      })}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="translateOrigin"
          render={({ field }) => {
            const query = api.translateOrigin.list.useQuery();

            return (
              <FormItem>
                <FormLabel>Rss Origin</FormLabel>
                <FormControl>
                  <div>
                    <Select
                      {...field}
                      loading={query.isPending}
                      options={query.data?.map((d) => {
                        return {
                          label: d.name,
                          value: d.id,
                        };
                      })}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="translatePrompt"
          render={({ field }) => {
            const query = api.translatePrompt.list.useQuery();

            return (
              <FormItem>
                <FormLabel>Rss Origin</FormLabel>
                <FormControl>
                  <div>
                    <Select
                      {...field}
                      loading={query.isPending}
                      options={query.data?.map((d) => {
                        return {
                          label: d.name,
                          value: d.id,
                        };
                      })}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Translate Language</FormLabel>
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
});

export default RssTranslateForm;
