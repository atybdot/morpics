"use client";

import { useQuery } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import Link from "next/link";
import { useContext } from "react";
import type { IconType } from "react-icons/lib";
import {
  PiAndroidLogoLight,
  PiAppleLogoLight,
  PiCrown,
  PiCrownSimple,
  PiGithubLogo,
  PiLinuxLogoLight,
  PiQuestionMarkLight,
  PiWindowsLogoLight,
} from "react-icons/pi";
import { toast } from "sonner";
import ProfileEditForm from "@/components/forms/profile-edit-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { CardAlt, CardContentAlt, CardHeaderAlt } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type AuthSession, sessionCtx } from "@/ctx/session";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { detectOS } from "@/utils/detect-user-agent";

function Page() {
  const session = useContext(sessionCtx) as AuthSession;
  const {
    data: activeSessions,
    isPending: loadingAllSessions,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["activeSessions"],
    queryFn: async () => {
      const result = await authClient.listSessions();
      return result.data;
    },
  });

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your profile</p>
      </div>
      <section className="space-y-6">
        <CardAlt outer={false}>
          <CardHeaderAlt className="text-muted-foreground text-base flex items-center justify-between">
            <span>account Info</span>
            {session.user.activeTier !== "pro" && (
              <Link
                className={cn(
                  buttonVariants({ size: "xs", variant: "dim" }),
                  "bg-indigo-500 dark:bg-indigo-600 text-foreground",
                )}
                href={"/pricing"}
              >
                <PiCrownSimple /> Upgrade to pro
              </Link>
            )}
          </CardHeaderAlt>
          <CardContentAlt className="p-6">
            <ProfileEditForm session={session} />
          </CardContentAlt>
        </CardAlt>
        <CardAlt outer={false}>
          <CardHeaderAlt className="text-muted-foreground text-base">
            Active Sessions
          </CardHeaderAlt>
          <CardContentAlt className="space-y-2 p-2">
            {loadingAllSessions
              ? Array(2)
                  .fill(0)
                  .map(() => (
                    <Skeleton key={nanoid()} className="w-full h-20" />
                  ))
              : activeSessions
                  ?.sort(
                    (i, j) =>
                      new Date(j.updatedAt).getTime() -
                      new Date(i.updatedAt).getTime(),
                  )
                  ?.map((s) => {
                    const os = detectOS(s.userAgent);
                    const isCurrent = s.token === session?.session?.token;
                    let Icon: IconType;
                    switch (os) {
                      case "ios":
                        Icon = PiAppleLogoLight;
                        break;
                      case "android":
                        Icon = PiAndroidLogoLight;
                        break;
                      case "linux":
                        Icon = PiLinuxLogoLight;
                        break;
                      case "windows":
                        Icon = PiWindowsLogoLight;
                        break;
                      default:
                        Icon = PiQuestionMarkLight;
                        break;
                    }
                    return (
                      <div key={nanoid()} className="p-2 relative border">
                        <div className="text-xs grid grid-cols-[auto_1fr] gap-2 items-center justify-center">
                          <p className="text-muted-foreground">platform:</p>
                          <span className="flex items-center gap-x-1">
                            <Icon className="size-4" />
                            {os}
                          </span>

                          <p className="text-muted-foreground">last updated:</p>
                          <span className=" break-all">
                            {s.updatedAt.toLocaleString()}
                          </span>
                          <p className="text-muted-foreground">created:</p>
                          <span className=" break-all">
                            {s.createdAt.toLocaleString()}
                          </span>
                          <p className="text-muted-foreground">ip</p>
                          <span className=" break-all">{s.ipAddress}</span>

                          <div className="col-span-full text-end">
                            <Button
                              className=" justify-end h-fit py-1 absolute sm:top-2 sm:right-2 top-0 right-0"
                              size={"xs"}
                              onClick={() => {
                                if (isCurrent) return;
                                toast.promise(
                                  authClient.revokeSession({ token: s.token }),
                                  {
                                    loading: "revoking session",
                                    success: () => {
                                      refetchSessions();
                                      return "session revoked";
                                    },
                                    error: (e) => {
                                      console.error(
                                        "[UNABLE TO REMOVE SESSION]",
                                        e,
                                      );

                                      return {
                                        message: "unable to revoke session",
                                        description:
                                          "see browser console for more details",
                                      };
                                    },
                                  },
                                );
                              }}
                              variant={isCurrent ? "secondary" : "destructive"}
                            >
                              {isCurrent ? "current" : "revoke"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
          </CardContentAlt>
        </CardAlt>
        {/* <div>
          <h3 className="border p-2 text-muted-foreground text-base border-b-0 bg-muted">
            Connected Apps
          </h3>
          <div className="border border-t-0 p-2 bg-background">
            {["github"].map((i) => (
              <div
                className="aspect-square w-fit p-1 content-center"
                key={nanoid()}
              >
                <PiGithubLogo className="size-8" />
              </div>
            ))}
          </div>
        </div> */}
      </section>
    </>
  );
}

export default Page;
