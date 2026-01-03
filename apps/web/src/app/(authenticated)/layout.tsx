import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import HeaderAlt from "@/components/header-alt";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { checkSession } from "@/lib/auth-utils";

async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { hasSession } = await checkSession({ headers });
  if (!hasSession) {
    return redirect("/sign-in");
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <section className=" mx-auto w-full overflow-h-auto grid grid-rows-[auto_1fr]">
        <HeaderAlt />
        <section className="mx-auto w-full p-4 pb-0 space-y-6 md:space-y-12">
          {children}
        </section>
      </section>
    </SidebarProvider>
  );
}

export default ProtectedLayout;
