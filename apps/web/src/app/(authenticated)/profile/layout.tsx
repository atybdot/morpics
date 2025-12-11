"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import type React from "react";
import { createContext } from "react";
import { PiSpinner } from "react-icons/pi";
import { sessionCtx } from "@/ctx/session";
import GoBackBtn from "@/components/elements/go-back-btn";
function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isPending, data } = authClient.useSession();
  const router = useRouter();

  if (isPending) {
    return (
      <section className="border p-2 w-full h-[97%] flex items-center justify-center">
        <PiSpinner className="size-8 animate-spin text-muted-foreground" />
      </section>
    );
  }

  if (!data?.user) {
    return router.push("/sign-in");
  }

  return (
    <sessionCtx.Provider value={data}>
      <section className="p-4 w-full relative">
        <GoBackBtn
          divProps={{ className: " absolute top-0 left-2" }}
          href="/images"
        />
        <section className="max-w-2xl mx-auto space-y-8">{children}</section>
      </section>
    </sessionCtx.Provider>
  );
}

export default Layout;
