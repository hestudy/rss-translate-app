"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { memo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { api } from "~/trpc/react";

const schema = z.object({
  rssOrigin: z.string().nonempty(),
  translateOrigin: z.string().nonempty(),
  translatePrompt: z.string().nonempty(),
});

const RssTranslateForm = memo((props: { onOk?: () => void }) => {
  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {},
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const mutation = api.rssTranslate.create.useMutation();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          await mutation.mutateAsync(values);
          toast.success("Create RssTranslate Success");
          props.onOk?.();
        })}
        className="space-y-2"
      >
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
        <div className="flex justify-end">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
});

export default RssTranslateForm;
