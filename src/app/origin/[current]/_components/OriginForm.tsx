"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { memo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

const OriginForm = memo(() => {
  const form = useForm<z.infer<typeof addRssOriginZObject>>({
    defaultValues: {
      name: "",
      link: "",
    },
    resolver: zodResolver(addRssOriginZObject),
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})} className="space-y-8">
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
      </form>
    </Form>
  );
});

export default OriginForm;
