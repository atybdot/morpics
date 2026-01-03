"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";
import { queryClient } from "@/utils/orpc";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import ToasterExtractor from "./ui/toaster-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
          <Suspense>
            <ToasterExtractor>{children}</ToasterExtractor>
          </Suspense>
          <ReactQueryDevtools buttonPosition="bottom-right" />
        </QueryClientProvider>
        <Toaster richColors className="rounded-none" />
      </ThemeProvider>
    </NuqsAdapter>
  );
}
