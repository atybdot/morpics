"use client";

import { SquareDashedMousePointerIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PiSquareHalf } from "react-icons/pi";
import { NavigationMenu } from "@/components/ui/navigation-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { nanoid } from "nanoid";

export default function HeaderAlt() {
  // const pathname = usePathname().split("/")[1] ?? "/";
  const pathname = usePathname().split("/").slice(1);
  const { toggleSidebar } = useSidebar();
  return (
    <section className="bg-background sticky top-0 z-10">
      <header
        className={cn(
          "flex flex-row items-center justify-center py-3 border-b backdrop-blur-sm w-full mx-auto sticky top-0",
          "sm:w-full px-4",
        )}
      >
        <NavigationMenu className={"w-full flex-1 gap-1 justify-between"}>
          <div className="flex items-center justify-center gap-2 text-blue-500">
            <Link href={"/dashboard"} className="">
              <SquareDashedMousePointerIcon className="size-5"/>
            </Link>
            {pathname?.map((link, idx) => {
              return (
                <Link
                  key={nanoid()}
                  href={`/${link}` as any}
                  className={cn("hidden md:block", idx === 0 ? "block" : "")}
                >
                  / {link}
                </Link>
              );
            })}
          </div>
          <Button
            size={"icon"}
            variant={"dim"}
            onClick={() => toggleSidebar()}
            className="md:hidden block"
          >
            <PiSquareHalf className="size-6" />
          </Button>
        </NavigationMenu>
      </header>
    </section>
  );
}
