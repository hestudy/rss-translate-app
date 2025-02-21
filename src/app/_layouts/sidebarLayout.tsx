import { BookType, Globe, Home, Rss, Terminal } from "lucide-react";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "RssTranslate",
    url: "/rssTranslate/1",
    icon: BookType,
  },
  {
    title: "RssOrigin",
    url: "/rssOrigin",
    icon: Rss,
  },
  {
    title: "TranslateOrigin",
    url: "/translateOrigin",
    icon: Globe,
  },
  {
    title: "TranslatePrompt",
    url: "/translatePrompt",
    icon: Terminal,
  },
];

const SidebarLayout = async (props: PropsWithChildren) => {
  const session = await auth();
  return (
    <HydrateClient>
      <main className="h-screen">
        {!session?.user && (
          <div className="flex h-full items-center justify-center">
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            >
              <Button>{session ? "Sign out" : "Sign in"}</Button>
            </Link>
          </div>
        )}
        {session?.user && (
          <SidebarProvider>
            <Sidebar>
              <SidebarHeader>RssTranslate</SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Application</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                            <a href={item.url}>
                              <item.icon />
                              <span>{item.title}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup />
              </SidebarContent>
              <SidebarFooter />
            </Sidebar>
            <main className="flex h-screen w-full flex-col p-4">
              <SidebarTrigger />
              <div className="h-0 flex-1 overflow-y-auto">{props.children}</div>
            </main>
          </SidebarProvider>
        )}
      </main>
    </HydrateClient>
  );
};

export default SidebarLayout;
