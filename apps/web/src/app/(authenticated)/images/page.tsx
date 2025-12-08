"use client";
import Loader from "@/components/loader";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Input,
  InputAddon,
  InputGroup,
  InputWrapper,
} from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { orpc, queryClient } from "@/utils/orpc";
import { faker } from "@faker-js/faker";
import { useMutation, useQuery } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import Link from "next/link";
import { useQueryState } from "nuqs";
import React from "react";

import {
  PiArrowSquareOut,
  PiCopy,
  PiEye,
  PiNotePencil,
  PiPencilSimple,
  PiPlus,
  PiPlusBold,
  PiSpinner,
  PiSpinnerBold,
  PiSpinnerGap,
  PiTrash,
  PiTrayArrowUp,
  PiX,
} from "react-icons/pi";
import { toast } from "sonner";

function Page() {
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: images, isPending } = useQuery(
    orpc.protectedRoutes.queries.getAllImages.queryOptions({
      input: {
        orgId: activeOrg?.id as string,
      },
      enabled: !!activeOrg?.id,
      queryKey: ["images"],
    }),
  );
  const [selectedImages, setSelectedImages] = React.useState<typeof images>([]);
  const deleteImageMutation = useMutation({
    mutationFn: async (keys: string[]) => {
      try {
        await Promise.allSettled(
          keys.map(
            async (i) =>
              await orpc.protectedRoutes.mutations.deleteimage.call(
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
      queryClient.refetchQueries({ queryKey: ["images"] });
      setSelectedImages([]);
    },
  });

  const isMobile = useIsMobile();
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 h-full gap-2 relative">
      <div className="col-span-full flex items-center justify-between flex-wrap gap-2 px-2">
        <div
          className={cn(
            buttonVariants({ variant: "secondary", size: "sm" }),
            "flex-row-reverse justify-between",
          )}
        >
          <Label>Select All images</Label>
          <Checkbox
            
            size={"xs"}
            className={"mr-1 opacity-80"}
            checked={selectedImages?.length === images?.length}
            indeterminate={
              selectedImages?.length !== images?.length &&
              (selectedImages?.length ?? 0) > 0
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

        <div className="flex flex-wrap items-center justify-between gap-x-2 md:gap-x-4 gap-y-2">
          {(selectedImages?.length ?? 0) > 0 && (
            <Button
              size={"sm"}
              variant={"destructive"}
              onClick={async () => {
                deleteImageMutation.mutate(
                  selectedImages?.map((i) => i.key) as string[],
                );
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
          <Link
            className={cn(buttonVariants({ size: "sm", variant: "secondary" }))}
            href={"/images/new"}
          >
            <PiPlusBold className="size-3"/> Upload Images
          </Link>
        </div>
      </div>
      <Separator className={"col-span-full mb-2"} />
      {isPending
        ? Array(isMobile ? 6 : 16)
            .fill(0)
            .map(() => <Skeleton key={nanoid()} className=" aspect-video h-full" />)
        : images?.map((item) => (
            <div key={nanoid()} className="flex flex-col border p-1 relative">
              <div
                className={cn(
                  "relative group flex-1 h-full aspect-square bg-muted",
                )}
              >
                <Checkbox
                  checked={!!selectedImages?.find((i) => i.key === item.key)}
                  onCheckedChange={(e) => {
                    if (e) {
                      setSelectedImages((p) => [...(p || []), item]);
                    } else {
                      setSelectedImages((p) =>
                        p?.filter((i) => i.key !== item.key),
                      );
                    }
                  }}
                  className={cn(
                    "absolute top-0.5 right-0.5 opacity-80 hover:opacity-100 cursor-pointer data-checked:opacity-100",
                  )}
                />
                <img className="object-contain aspect-square" src={item.url} />
              </div>
              <div className="flex items-center gap-4 ps-2 h-9 border-b-0 border mt-1">
                <h3 className="text-muted-foreground text-sm truncate flex-1">
                  {item.key}
                </h3>
                <Button
                  className="bg-muted h-full"
                  variant={"dim"}
                  size={"icon"}
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
                  href={`/images/${item.key}`}
                >
                  <PiArrowSquareOut className="size-3.5" /> View details
                </Link>
              </div>
            </div>
          ))}{" "}
    </section>
  );
}

export default Page;
