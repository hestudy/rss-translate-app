import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { Toaster } from "~/components/ui/sonner";
import { TRPCReactProvider } from "~/trpc/react";
import SidebarLayout from "./_layouts/sidebarLayout";

export const metadata: Metadata = {
  title: "RssTranslate App",
  description: "RssTranslate App",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  keywords: [
    "rss",
    "translate",
    "rss-translate",
    "rss-translate-app",
    "ai translate",
    "openai translate",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <SidebarLayout>{children}</SidebarLayout>
        </TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
