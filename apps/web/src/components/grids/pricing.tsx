"use client";
import { PRICING_TABLE, type UserTier } from "@morpics/db/schema/constants";
import { nanoid } from "nanoid";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { PiAsteriskBold, PiCheckSquare, PiSpinner } from "react-icons/pi";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import TierChip from "../elements/tier-chip";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";

function PricingGrid() {
  const { isPending, data: session } = authClient.useSession();

  const discountedPrice = (price: number, discount: number) => {
    return Math.round(price - price * (discount / 100));
  };

  const errorTxt = useSearchParams().get("error");
  useEffect(() => {
    if (errorTxt) {
      toast.error(errorTxt, { description: "Select Your plan here" });
    }
  }, [errorTxt]);

  return (
    <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 col-span-full gap-0.5">
      {Object.values(PRICING_TABLE).map((table) => {
        const description =
          table.slug === "free"
            ? "apps that need reliable image processing"
            : table.slug === "starter"
              ? "apps that need reliable image processing"
              : "teams with scale or advanced workflow needs";

        const btn =
          table.slug === "free"
            ? "Sign up for free"
            : table.slug === "starter"
              ? "get started"
              : "start with pro";
        return (
          <div
            key={nanoid()}
            className={cn(
              "border w-full relative space-y-4 h-full origin-bottom backdrop-blur-sm bg-background",
            )}
          >
            {table.slug === "starter" && (
              <Badge
                variant="info"
                size={"lg"}
                className=" absolute top-0 right-0"
              >
                <PiAsteriskBold /> popular
              </Badge>
            )}
            <div className="p-4 grid grid-rows-[1fr_auto_auto] gap-4 h-full">
              <div>
                <h1
                  className={cn(
                    table.slug === "starter"
                      ? "text-2xl font-semibold"
                      : "text-muted-foreground font-medium",
                    " mt-2",
                  )}
                >
                  <TierChip
                    slug={String(table.slug) as UserTier}
                    className={cn(
                      "mb-1",
                      table.slug === "starter"
                        ? "size-6 -mt-1"
                        : "size-4 text-muted-foreground",
                    )}
                  />
                  {String(table.slug)}
                </h1>
                <h5 className="text-muted-foreground text-xs">{description}</h5>
                <div className="flex items-end my-4">
                  <h2 className="text-6xl font-semibold">
                    ${discountedPrice(table.price, table.discount)}
                  </h2>
                  <p className="text-2xl text-muted-foreground">/{"month"}</p>
                </div>
              </div>
              <div className="space-y-4 ">
                {Object.entries(table.package).map((item) => {
                  return (
                    <div
                      key={nanoid()}
                      className=" grid grid-cols-[auto_1fr] place-items-start text-muted-foreground"
                    >
                      <PiCheckSquare className="size-4.5 mr-2 inline mt-0.5 " />
                      <div className="space-x-1 tracking-wide">
                        <span>
                          {item[1].allowed}
                          {item[1].unit} {item[1].label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                href={
                  session?.session
                    ? {
                        pathname: "/checkout",
                        query: {
                          slug: table.slug as string,
                        },
                      }
                    : {
                        pathname: "/sign-in",
                        query: {
                          redirect: "/checkout",
                          slug: table.slug as string,
                        },
                      }
                }
                className={cn(
                  buttonVariants({
                    size: "lg",
                    variant: table.slug === "starter" ? "primary" : "secondary",
                  }),
                  "w-full",
                )}
              >
                {isPending ? <PiSpinner className="animate-spin" /> : btn}
              </Link>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default PricingGrid;
