"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { nanoid } from "nanoid";
import Link from "next/link";
import React from "react";
import {
  PiArrowCounterClockwise,
  PiArrowSquareOut,
  PiCopy,
  PiPlusBold,
  PiSpinner,
  PiTrash,
  PiTray,
  PiTrayArrowUp,
} from "react-icons/pi";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { orpc, queryClient } from "@/utils/orpc";

function Page() {
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const { data: activeOrg } = authClient.useActiveOrganization();
  const {
    data: images,
    isPending,
    error,
    refetch: refetchImages,
  } = useQuery(
    orpc.images.all.queryOptions({
      input: {
        bucketId: activeOrg?.id as string,
        bucket: activeOrg?.slug as string,
      },
      enabled: !!activeOrg?.id,
      queryKey: ["images", "all-images"],
    }),
  );
  const [selectedImages, setSelectedImages] = React.useState<typeof images>([]);
  const deleteImageMutation = useMutation({
    mutationFn: async (keys: string[]) => {
      if (!activeOrg?.id) {
        return;
      }
      try {
        await Promise.allSettled(
          keys.map(
            async (i) =>
              await orpc.images.delete.call(
                { key: i },
                { signal: abortControllerRef.current?.signal },
              ),
          ),
        );
      } catch (error) {
        console.log(error);

        toast.error("unable to delete image(s)", {
          description: "see browser console for more details",
        });
      }
    },
    onSuccess: () => {
      toast.success("image(s) delete successfully", { closeButton: true });
      queryClient.invalidateQueries({ queryKey: ["images", "all-images"] });
      setSelectedImages([]);
    },
  });

  const isMobile = useIsMobile();
  const [_, copyToClipboard] = useCopyToClipboard();
  if (error) {
    console.log(error);

    return (
      <div className="flex items-center justify-center h-full relative">
        <Card className="w-full max-w-sm p-2">
          <CardContent className="border w-full px-6 py-10 pt-14">
            <div className="flex flex-col items-center space-y-4 text-muted-foreground">
              <PiTray className="size-12" />

              <div className="space-y-2 text-center">
                <h1 className="text-xl font-semibold text-foreground">error</h1>
                <p className="text-muted-foreground text-sm text-pretty">unable to fetch images</p>
              </div>
              <Button variant={"secondary"} onClick={() => refetchImages()}>
                <PiArrowCounterClockwise />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return images?.length === 0 ? (
    <Empty />
  ) : (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 relative ">
      <div className="col-span-full flex items-center justify-between flex-wrap gap-2 px-2">
        <h1 className="text-2xl">Images</h1>
        <div className="flex gap-2 flex-wrap mb-2">
          <div className="flex flex-wrap items-center justify-between gap-2 md:gap-x-4">
            <div
              className={cn(
                buttonVariants({ variant: "dim", size: "sm" }),
                "flex-row-reverse justify-between",
              )}
            >
              <Label className="text-sm font-medium">Select All images</Label>
              <Checkbox
                size={"xs"}
                className={"mr-1 opacity-80"}
                checked={selectedImages?.length === images?.length}
                indeterminate={
                  selectedImages?.length !== images?.length && (selectedImages?.length ?? 0) > 0
                }
                onCheckedChange={(e) => {
                  if (e) {
                    setSelectedImages(images);
                  } else {
                    setSelectedImages([]);
                  }
                }}
              />
            </div>
            {(selectedImages?.length ?? 0) > 0 && (
              <Button
                size={"sm"}
                variant={"destructive"}
                onClick={async () => {
                  deleteImageMutation.mutate(selectedImages?.map((i) => i.key) as string[]);
                }}
                disabled={deleteImageMutation.isPending}
              >
                {deleteImageMutation.isPending ? (
                  <>
                    <PiSpinner className="animate-spin" /> deleting...
                  </>
                ) : (
                  <>
                    <PiTrash />
                    Delete{" "}
                    {selectedImages?.length === images?.length
                      ? "all"
                      : selectedImages?.length}{" "}
                    image
                  </>
                )}
              </Button>
            )}
            <Link className={cn(buttonVariants({ size: "sm" }))} href={"/images/new"}>
              <PiPlusBold className="size-3" /> Upload Images
            </Link>
          </div>
        </div>
      </div>
      {isPending
        ? Array(isMobile ? 6 : 16)
            .fill(0)
            .map(() => <Skeleton key={nanoid()} className=" aspect-video w-full" />)
        : images?.map((item) => (
            <div key={nanoid()} className="flex flex-col border p-1 relative">
              <div className={cn("relative group flex-1 h-full aspect-square bg-muted")}>
                <Checkbox
                  checked={!!selectedImages?.find((i) => i.key === item.key)}
                  onCheckedChange={(e) => {
                    if (e) {
                      setSelectedImages((p) => [...(p || []), item]);
                    } else {
                      setSelectedImages((p) => p?.filter((i) => i.key !== item.key));
                    }
                  }}
                  className={cn(
                    "absolute top-0.5 right-0.5 opacity-80 hover:opacity-100 cursor-pointer data-checked:opacity-100",
                  )}
                />
                <img className="object-contain aspect-square" src={item.url} />
              </div>
              <div className="flex items-center gap-4 ps-2 h-9 border-b-0 border mt-1">
                <h3 className="text-muted-foreground text-sm truncate flex-1">{item.key}</h3>
                <Button
                  className="bg-muted h-full"
                  variant={"dim"}
                  size={"icon"}
                  onClick={() => {
                    copyToClipboard(item.key);
                    toast.info("image key copied to clipboard", {
                      description: item.key,
                      classNames: { description: "text-xs" },
                    });
                  }}
                  title="copy image key"
                >
                  <PiCopy />
                </Button>
              </div>
              <div className="flex items-center bg-secondary h-9 border">
                <Link
                  className={cn(
                    buttonVariants({ variant: "dim", size: "sm" }),
                    "flex-1 font-light text-sm h-full bg-background ",
                  )}
                  href={`/images/${item.key.split("/")[1]}`}
                >
                  <PiArrowSquareOut className="size-3.5" /> View details
                </Link>
              </div>
            </div>
          ))}
    </section>
  );
}

export default Page;
function Empty() {
  return (
    <div className="flex items-center justify-center h-full relative">
      <Card className="w-full max-w-sm p-2">
        <CardContent className="border w-full px-6 py-10 pt-14">
          <div className="flex flex-col items-center space-y-4 text-muted-foreground">
            <PiTray className="size-12" />

            <div className="space-y-2 text-center">
              <h1 className="text-xl font-semibold text-foreground">It's Empty here</h1>
              <p className="text-muted-foreground text-sm text-pretty">No images found</p>
            </div>
            <Link className={cn(buttonVariants())} href={"/images/new"}>
              <PiTrayArrowUp />
              Upload images
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
