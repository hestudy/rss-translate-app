"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

const schema = z.object({
  name: z.string().nonempty(),
  prompt: z.string().nonempty(),
});

const TranslatePromptForm = memo(
  (props: { onOk?: () => void; id?: string }) => {
    const form = useForm<z.infer<typeof schema>>({
      resolver: zodResolver(schema),
      defaultValues: {
        name: "",
        prompt: "",
      },
      mode: "onChange",
    });

    const mutation = api.translatePrompt.create.useMutation();

    const query = api.translatePrompt.info.useQuery(
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

    const updateMutation = api.translatePrompt.update.useMutation();

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            if (props.id) {
              await updateMutation.mutateAsync({
                id: props.id,
                ...values,
              });
              toast.success("Prompt updated");
            } else {
              await mutation.mutateAsync(values);
              toast.success("Prompt created");
            }
            props.onOk?.();
          })}
          className="relative space-y-2"
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="h-[200px]" />
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

export default TranslatePromptForm;
