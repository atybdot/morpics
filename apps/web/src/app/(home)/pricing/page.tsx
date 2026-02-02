import React from "react";
import { FaqsGridPrice } from "@/components/grids/faqs";
import PricingGrid from "@/components/grids/pricing";

function Page() {
  return (
    <>
      <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-0.5 bg-secondary gap-0.5 my-32">
        <h2 className="col-span-full py-2 text-center text-xl bg-muted ">Pricing</h2>
        <PricingGrid />
      </section>
      <section className="w-full grid grid-cols-1 p-0.5 bg-secondary gap-0.5 my-32">
        <h2 className="col-span-full py-2 text-center text-xl bg-muted ">
          Frequently Asked Questions
        </h2>
        <FaqsGridPrice />
      </section>
    </>
  );
}

export default Page;
