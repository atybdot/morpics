"use client";
import { nanoid } from "nanoid";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { JSX } from "react";
import { FaGithub } from "react-icons/fa6";
import {
  PiBooks,
  PiBugBeetle,
  PiCaretUpDown,
  PiCircleHalf,
  PiCreditCard,
  PiGear,
  PiGearSix,
  PiImagesSquare,
  PiLifebuoy,
  PiPlugs,
  PiPlus,
  PiPlusSquare,
  PiShoppingBag,
  PiSignOut,
  PiSlidersHorizontal,
  PiSquareHalf,
  PiTrayArrowUp,
  PiUser,
  PiUsers,
  PiXLogo,
} from "react-icons/pi";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/use-theme";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button, buttonVariants, type ButtonProps } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPositioner,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Skeleton } from "./skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { SquareDashedMousePointerIcon } from "lucide-react";
interface SidebarItembase {
  title: string;
  icon: JSX.ElementType;
}
type SidebarItem = SidebarItembase & {
  subItems?: SidebarItem[];
} & (
    | ({ as: "a" } & React.ComponentProps<"a">)
    | ({ as: "button" } & ButtonProps)
  );
export function AppSidebar() {
  const { toggleSidebar } = useSidebar();
  const { data: session, isPending } = authClient.useSession();
  const { toggleTheme } = useTheme();
  const naviItems: Record<string, SidebarItem[]> = {
    header: [
      {
        title: "images",
        href: "/images",
        icon: PiImagesSquare,
        as: "a",
      },
      {
        title: "Buckets",
        href: "/buckets",
        icon: PiShoppingBag,
        as: "a",
      },
    ],
    bottom: [
      {
        title: "docs",
        href: "/docs",
        icon: PiBooks,
        as: "a",
      },
      {
        as: "a",
        title: "api",
        href: "/profile/api",
        icon: PiPlugs,
      },
      {
        as: "a",
        title: "support",
        href: "/support",
        icon: PiLifebuoy,
      },
      {
        as: "a",
        title: "report",
        href: "/report",
        icon: PiBugBeetle,
      },
    ],
    footer: [
      {
        title: "profile",
        href: "/profile",
        icon: PiUser,
        as: "a",
      },
      {
        title: "billing",
        href: "/profile/billing",
        icon: PiCreditCard,
        as: "a",
      },
      {
        title: "Settings",
        href: "/profile/settings",
        icon: PiGearSix,
        as: "a",
      },
    ],
    socials: [
      {
        title: "toggle theme",
        variant: "dim",
        className: " justify-start",
        as: "button",
        onClick: () => toggleTheme(),
        icon: PiCircleHalf,
      },
      {
        title: "x.com",
        href: "https://x.com/atybdot",
        as: "a",
        target: "_blank",
        icon: PiXLogo,
      },
      {
        title: "github",
        href: "https://github.com/atybdot",
        as: "a",
        target: "_blank",
        icon: FaGithub,
      },
    ],
  };

  const pathname = usePathname();
  const router = useRouter();
  const useMobile = useIsMobile();
  return (
    <Sidebar className="border" collapsible="icon">
      <SidebarContent className="gap-0">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={
                  <Button
                    size={"icon"}
                    variant={"dim"}
                    className="mr-2 inline"
                  />
                }
                className={cn(
                  "font-light text-muted-foreground relative hover:bg-transparent w-fit ml-auto",
                )}
                onClick={() => toggleSidebar()}
              >
                <PiSquareHalf />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarSeparator className={"m-0"} />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {naviItems.header.map(
                ({ as, title, icon: Icon, subItems, ...item }) => (
                  <SidebarMenuItem key={title} className="relative">
                    <SidebarMenuButton
                      render={
                        as === "button" ? (
                          <Button {...(item as ButtonProps)} />
                        ) : (
                          //@ts-expect-error
                          <Link {...item} />
                        )
                      }
                      //@ts-expect-error
                      isActive={pathname === item?.href}
                      className={cn(
                        "font-light text-muted-foreground z-5 relative",
                        // item?.className,
                      )}
                    >
                      <Icon className="stroke-1" />
                      <span>{title}</span>

                      {pathname === item?.href  && (
                        <div className="pl-0.5 inset-y-0 absolute bg-primary left-0" />
                      )}
                    </SidebarMenuButton>
              
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className={"mx-0 my-0 mt-auto"} />
        <SidebarGroup className="">
          <SidebarGroupContent>
            <SidebarMenu>
              {naviItems.bottom.map(({ as, ...item }) => (
                <SidebarMenuItem key={item.title} className="relative">
                  <SidebarMenuButton
                    render={
                      as === "button" ? (
                        <Button {...(item as ButtonProps)} />
                      ) : (
                        //@ts-expect-error
                        <Link {...item} />
                      )
                    }
                    //@ts-expect-error
                    isActive={pathname === item?.href}
                    className={cn(
                      "font-light text-muted-foreground z-5 relative",
                    )}
                  >
                    <item.icon className="stroke-1" />
                    <span className="">{item.title}</span>
                    {pathname === item?.href && (
                      <div className="pl-0.5 inset-y-0 absolute bg-primary left-0" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className={"mx-0 my-0"} />
        <SidebarGroup className="">
          <SidebarGroupContent>
            <SidebarMenu>
              {naviItems.socials.map(({ as, ...item }) => (
                <SidebarMenuItem key={item.title} className="relative">
                  <SidebarMenuButton
                    render={
                      as === "button" ? (
                        <Button {...(item as ButtonProps)} />
                      ) : (
                        //@ts-expect-error
                        <Link {...item} />
                      )
                    }
                    //@ts-expect-error
                    isActive={pathname === item?.href}
                    className={cn(
                      "font-light text-muted-foreground z-5 relative",
                      // item?.className,
                    )}
                  >
                    <item.icon className="stroke-1" />
                    <span className="">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className={"mx-0 my-0"} />
        <SidebarFooter>
          {!isPending ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="h-fit p-1 items-center gap-x-2 flex aria-[expanded='true']:bg-accent aria-[expanded='true']:text-sidebar-accent-foreground w-full "
                  />
                }
              >
                <Avatar className={"size-8 aspect-square"}>
                  <AvatarImage src={session?.user.image as string} />
                  <AvatarFallback
                    className={"text-lg object-cover aspect-square"}
                  >
                    {session?.user.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start justify-center flex-1 font-light gap-0.5 group-data-[state='collapsed']:hidden">
                  <p> {session?.user.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {session?.user.email}
                  </p>
                </div>
                <PiCaretUpDown className="size-4 mr-1 group-data-[state='collapsed']:hidden" />
              </DropdownMenuTrigger>
              <DropdownMenuPositioner
                align="end"
                side={useMobile ? "top" : "left"}
              >
                <DropdownMenuContent
                  className={cn(
                    useMobile ? "mb-2" : "-mb-1",
                    "text-sm font-light min-w-48 ml-4 text-muted-foreground",
                  )}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuLabel
                      className={"text-muted-foreground/70 text-xs"}
                    >
                      Account
                    </DropdownMenuLabel>
                    {naviItems.footer.map(({ as, ...item }) => (
                      <SidebarMenuButton
                        key={nanoid()}
                        render={
                          as === "button" ? (
                            <Button {...(item as ButtonProps)} />
                          ) : (
                            //@ts-expect-error
                            <Link {...(item as React.ComponentProps<"a">)} />
                          )
                        }
                        //@ts-expect-error
                        isActive={pathname === item?.href}
                        className={cn(
                          "font-light text-muted-foreground z-5 relative",
                          // item?.className,
                        )}
                      >
                        <item.icon className="stroke-1" />
                        <span className="">{item.title}</span>

                        {pathname === item?.href && (
                          <div className="pl-0.5 inset-y-0 absolute bg-primary left-0" />
                        )}
                      </SidebarMenuButton>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      authClient.signOut({
                        fetchOptions: {
                          onSuccess: () => {
                            router.push("/sign-in");
                          },
                        },
                      });
                    }}
                    className={
                      " cursor-pointer text-muted-foreground hover:text-foreground"
                    }
                  >
                    <PiSignOut />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPositioner>
            </DropdownMenu>
          ) : (
            <Skeleton className="w-full h-12 flex gap-2 bg-transparent">
              <Skeleton className="w-8 h-full" />
              <Skeleton className="w-full" />
            </Skeleton>
          )}
        </SidebarFooter>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
