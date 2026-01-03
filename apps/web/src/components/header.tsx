"use client";
import { Loader } from "lucide-react";
import { nanoid } from "nanoid";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiListBold as Menu } from "react-icons/pi";
import {
  NavigationMenu,
  NavigationMenuPopup,
  NavigationMenuPositioner,
} from "@/components/ui/navigation-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Logo } from "./elements/logo";
import { Button, type ButtonProps, buttonVariants } from "./ui/button";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "./ui/sheet";

type NavLinkVariant = { asLink: true; href: string; className?: string };

type NavLink = NavLinkVariant & { label: string };

export default function Header() {
  const navLink: {
    brand: Pick<NavLink, "label"> & { imgURL?: string };
    links: NavLink[];
    cta: NavLink;
  } = {
    brand: {
      label: "morpics",
    },
    links: [{ label: "docs", href: "/docs", asLink: true }],
    cta: { label: "get started", asLink: true, href: "/sign-in" },
  };

  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  return (
    <section className="bg-background/50 sticky top-0 z-10">
      <header
        className={cn(
          "flex flex-row items-center justify-center border-b backdrop-blur-sm w-full mx-auto sticky top-0",
          "sm:w-full sm:px-12 px-4 py-2 sm:py-4 ",
        )}
      >
        <NavigationMenu className={"w-full flex-1 gap-1 justify-between"}>
          <Logo />

          <div className="space-x-2 items-center hidden sm:flex">
            <Link
              href={"/docs" as any}
              className={cn(
                buttonVariants({ variant: "outline", size: "xs" }),
                "text-sm",
              )}
            >
              go to docs
            </Link>
            <AuthBtn
              showLogin={!session?.session}
              isPending={isPending}
              size={"xs"}
            />
          </div>

          {/* mobile menu */}
          <Sheet>
            <SheetTrigger
              className={"block sm:hidden ml-auto content-center"}
              render={<Button variant={"ghost"} size={"icon"} />}
            >
              <Menu className="size-5 ml-auto" />
            </SheetTrigger>
            <SheetContent showClose={false} side="top">
              <SheetHeader className="pb-0 pt-4 flex flex-row items-center justify-between text-muted-foreground">
                Navigation
                <SheetClose />
              </SheetHeader>
              <SheetBody className="flex flex-col items-start justify-center gap-2">
                <div className="bg-muted/50 w-full p-2 relative border">
                  {pathname === "/" && (
                    <div className="p-0.5 bg-primary h-8/12 absolute left-0 top-1/2 -translate-y-1/2  -translate-x-0.5" />
                  )}
                  <span className="ml-1">home</span>
                </div>
                {navLink.links.map((link) => {
                  return (
                    <div
                      className="group hover:bg-muted w-full p-2 relative"
                      key={nanoid()}
                    >
                      {pathname === link.href && (
                        <div className="hidden group-hover:block p-0.5 bg-primary h-8/12 absolute left-0 top-1/2 -translate-y-1/2" />
                      )}
                      <Link href={link.href as any} className="ml-1">
                        {link.label}
                      </Link>
                    </div>
                  );
                })}

                <AuthBtn showLogin={!session?.session} isPending={isPending} />
              </SheetBody>
            </SheetContent>
          </Sheet>

          <NavigationMenuPositioner>
            <NavigationMenuPopup />
          </NavigationMenuPositioner>
        </NavigationMenu>
      </header>
    </section>
  );
}

function AuthBtn({
  isPending,
  showLogin,
  className,
  size,
}: {
  isPending: boolean;
  showLogin: boolean;
  className?: string;
  size?: ButtonProps["size"];
}) {
  return (
    <Link
      href={showLogin ? "/sign-in" : "/dashboard"}
      className={cn(
        buttonVariants({ variant: "primary", size }),
        "text-sm w-full",
        className,
      )}
    >
      {isPending && <Loader className="animate-spin " />}
      {isPending ? "loading" : showLogin ? "Sign in" : "dashboard"}
    </Link>
  );
}
