"use client";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { ThemeSwitcherButton } from "./elements/theme-switcher-button";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import UserMenu from "./user-menu";

export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/upload-files", label: "upload-image" },
  ] as const;
  const { data: activeOrg, isPending } = authClient.useActiveOrganization();

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to}>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isPending ? (
            <Skeleton className="w-12 h-3" />
          ) : (
            <Button variant={"secondary"} size={"sm"}>
              active:org {activeOrg?.name}
            </Button>
          )}
          <ThemeSwitcherButton />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
