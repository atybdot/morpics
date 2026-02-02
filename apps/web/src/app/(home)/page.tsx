import Link from "next/link";
import { FaqsGridHome } from "@/components/grids/faqs";
import FeaturesGrid from "@/components/grids/features";
import HowItWorksGrid from "@/components/grids/how-it-works";
import PricingGrid from "@/components/grids/pricing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ImageMotion from "../../components/image-motion";
export default function Home() {
  return (
    <section className="space-y-12">
      <section className="max-w-screen w-full relative sm:min-h-[calc(100svh-4rem)] md:content-center grid md:grid-cols-2 gap-8">
        <div className="space-y-4 py-12 content-center">
          <h1 className="text-4xl md:text-[3.5rem] font-semibold tracking-tighter text-balance">
            URL-powered image manipulations
          </h1>
          <h2 className="text-sm text-balance md:text-lg mx-auto text-muted-foreground">
            Clean, declarative URLs that generate every image your app needs.
          </h2>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 sm:gap-8">
            <Link href={"/dashboard"} className={cn(buttonVariants({ size: "lg" }))}>
              Try for free
            </Link>
            <Link
              href={"/playground"}
              className={cn(
                buttonVariants({ size: "lg", variant: "secondary" }),
                "bg-secondary text-secondary-foreground/50",
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
      <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-0.5 bg-secondary gap-0.5 my-32 mt-0">
        <h2 className="col-span-full py-2 text-center text-xl bg-muted ">How It Works?</h2>
        <HowItWorksGrid />
      </section>
      <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-0.5 bg-secondary gap-0.5 my-32">
        <h2 className="col-span-full py-2 text-center text-xl bg-muted ">features</h2>
        <FeaturesGrid />
      </section>
      <section className="w-full grid grid-cols-1 p-0.5 bg-secondary gap-0.5 my-32">
        <h2 className="col-span-full py-2 text-center text-xl bg-muted ">
          Frequently Asked Questions
        </h2>
        <FaqsGridHome />
      </section>
      <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-0.5 bg-secondary gap-0.5 my-32">
        <h2 className="col-span-full py-2 text-center text-xl bg-muted ">Pricing</h2>
        <PricingGrid />
      </section>
    </section>
  );
}
