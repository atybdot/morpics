"use client";

import { useQueries } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { nanoid } from "nanoid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PiCaretRight,
  PiCubeTransparent,
  PiImageSquare,
  PiPlus,
  PiShoppingBag,
  PiShoppingBagOpenThin,
  PiUsersBold,
} from "react-icons/pi";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipPositioner,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

function Page() {
  const { data: allOrgs, isPending } = authClient.useListOrganizations();
  const { data: session } = authClient.useSession();

  const OrgInfo = useQueries({
    queries:
      allOrgs?.map((org) =>
        orpc.bucket.stats.queryOptions({
          input: { bucketId: org.id, bucket: org.slug },
          enabled: !!allOrgs && allOrgs.length > 0,
        }),
      ) ?? [],
  });
  const router = useRouter();
  const isMobile = useIsMobile();
  return (
    <section className="space-y-4 h-full">
      <div className="flex items-center justify-between flex-wrap">
        <h1 className="text-2xl">Your Buckets</h1>
        <Link
          title="create new bucket"
          className={cn(buttonVariants({ size: isMobile ? "icon" : "sm" }))}
          href={"/buckets/new"}
        >
          <PiPlus />
          {!isMobile && "New Bucket"}
        </Link>
      </div>
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1 h-11/12 grid-flow-row">
        {isPending &&
          Array(9)
            .fill(0)
            .map((_) => <Skeleton key={nanoid()} className="w-full" />)}
        {!isPending && (allOrgs?.length === 0 || allOrgs === null) && (
          <div className="border p-2 col-span-full">
            <div className="p2 border h-full flex justify-center items-center flex-col text-muted-foreground">
              <PiShoppingBagOpenThin className="size-12" />
              <h1 className="text-lg mb-2 text-balance">No buckets found</h1>
              <Link
                href={"/buckets/new"}
                className={cn(
                  buttonVariants({ variant: "primary", size: "lg" }),
                  "w-fit mx-auto",
                )}
              >
                <Plus />
                Create New bucket
              </Link>
            </div>
          </div>
        )}

        {!isPending &&
          allOrgs?.map((org) => (
            <div className="border p-1 w-full h-fit bg-muted" key={nanoid()}>
              <div className="border p-2 h-full flex flex-col bg-background">
                <div className="flex-1 p-2 ">
                  <div className=" aspect-square overflow-hidden w-10 text-muted-foreground">
                    {org.logo ? (
                      <img
                        src={org.logo}
                        className="size-8 aspect-square object-cover"
                      />
                    ) : (
                      <PiShoppingBag className="size-8" />
                    )}
                  </div>
                  <h2 className="text-lg mb-4"> {org.name}</h2>
                  {OrgInfo.some((q) => q.isPending) ? (
                    <Skeleton className="w-full h-6" />
                  ) : (
                    OrgInfo.filter(
                      (o) => (o.data?.bucketId ?? "") === org.id,
                    ).map((o) => (
                      <div
                        key={o.data?.bucketId}
                        className="flex flex-wrap text-sm text-muted-foreground gap-4"
                      >
                        <Chip
                          description="total members"
                          icon={<PiUsersBold />}
                          text={o.data?.members}
                        />
                        <Chip
                          description="total images"
                          icon={<PiImageSquare />}
                          text={o.data?.images}
                        />
                        <Chip
                          description="total transformations"
                          icon={<PiCubeTransparent />}
                          text={o.data?.transformations ?? 0}
                        />
                      </div>
                    ))
                  )}
                </div>

                <Separator />
                <Button
                  variant={"dim"}
                  size={"md"}
                  className={cn("w-full justify-end")}
                  key={org.id}
                  onClick={async () => {
                    if (session) {
                      if (session?.session?.activeOrganizationId === org.id) {
                        return router.push("/images");
                      }
                    }
                    toast.promise(
                      authClient.organization.setActive({
                        organizationId: org.id,
                        organizationSlug: org.slug,
                      }),
                      {
                        loading: "switching bucket...",
                        success: () => {
                          router.push("/images");
                          return "bucket switched";
                        },
                        error: () => {
                          return "unable to switch bucket";
                        },
                      },
                    );
                  }}
                >
                  see images
                  <PiCaretRight />
                </Button>
              </div>
            </div>
          ))}
      </section>
    </section>
  );
}

export default Page;

function Chip({
  text,
  icon,
  description,
}: {
  text: string | number | null | undefined;
  icon: React.ReactNode;
  description?: string | React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<div />}
        className="flex items-center justify-between border"
      >
        <span className="size-6 inline-flex items-center justify-center">
          {icon}
        </span>

        <p className="text-base px-1 h-6 w-10 text-center bg-muted content-center cursor-default">
          {text}
        </p>
      </TooltipTrigger>

      <TooltipPositioner side="bottom">
        {description && <TooltipContent>{description}</TooltipContent>}
      </TooltipPositioner>
    </Tooltip>
  );
}
