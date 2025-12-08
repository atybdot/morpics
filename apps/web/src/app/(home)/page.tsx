import Link from "next/link";
import FeaturesGrid from "@/components/grids/features-grid";
import PricingGrid from "@/components/grids/pricing-grid";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ImageMotion from "../../components/image-motion";
export default function Home() {
  return (
    <section className="space-y-12">
      <section className="max-w-screen w-full relative sm:min-h-[calc(100svh-4rem)] md:content-center grid md:grid-cols-2 gap-8">
        <div className="space-y-4 py-12">
          <h1 className="text-6xl md:text-[5.5rem] font-semibold tracking-tighter text-balance">
            The API your images deserve
          </h1>
          <h2 className="text-sm text-balance md:text-lg mx-auto text-muted-foreground">
            A clean, declarative API for transforming and optimizing images
          </h2>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 sm:gap-8">
            <Link
              href={"/dashboard"}
              className={cn(buttonVariants({ size: "xl" }))}
            >
              Try for free
            </Link>
            <Link
              href={"/playground"}
              className={cn(
                buttonVariants({ size: "xl", variant: "secondary" }),
                "bg-secondary/40 text-secondary-foreground/50",
              )}
            >
              playground
            </Link>
          </div>
        </div>
        <div className="pb-12 content-center">
          <ImageMotion />
        </div>
      </section>
      <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-0.5 bg-secondary gap-0.5 my-16">
        <h2 className="col-span-full py-2 text-center text-xl bg-muted ">
          features
        </h2>
        <FeaturesGrid />
      </section>

      <PricingGrid />
    </section>
  );
}
