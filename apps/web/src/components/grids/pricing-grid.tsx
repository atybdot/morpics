"use client";
import { useState } from "react";
import {
  PiAsteriskBold,
  PiCheckSquare,
} from "react-icons/pi";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { nanoid } from "nanoid";
interface PricingItems {
  type: "general" | "main";
  heading: string;
  description: string;
  price: { year: number; month: number };
  packge: { offer?: string; label: string }[];
  notInPackge?: { label: string }[];
  button: { label: string; action: (plan: string) => void };
}
function PricingGrid() {
  const [year, _sy] = useState(true);
  const pricingItems: PricingItems[] = [
    {
      type: "general",
      heading: "free",
      description: "testing, side projects, and light usage",
      price: { year: 0, month: 0 },
      button: {
        label: "Sign up for free",
        action(_plan) {
          return;
        },
      },
      packge: [
        { offer: "100", label: "transformations" },
        { offer: "2gb", label: "cache storage" },
        { offer: "0.5gb", label: "bucket storage" },
        { offer: "10", label: "AI Modifications" },
        { offer: "10gb", label: "bandwidth" },
        { offer: "0", label: "team member" },
      ],
    },
    {
      type: "main",
      heading: "starter",
      description: "apps that need reliable image processing",
      price: { year: 8, month: 10 },
      button: {
        label: "get started",
        action(_plan) {
          return;
        },
      },
      packge: [
        { offer: "5k", label: "transformations" },
        { offer: "10gb", label: "cache storage" },
        { offer: "3gb", label: "bucket storage" },
        { offer: "500", label: "AI Modifications" },
        { offer: "25gb", label: "bandwidth" },
        { offer: "5", label: "team members" },
      ],
    },
    {
      type: "general",
      heading: "pro",
      description: "teams with scale or advanced workflow needs",
      price: { year: 16, month: 20 },
      button: {
        label: "start with pro",
        action(_plan) {
          return;
        },
      },
      packge: [
        { offer: "15k", label: "transformations" },
        { offer: "20gb", label: "cache storage" },
        { offer: "10gb", label: "bucket storage" },
        { offer: "2k", label: "AI Modifications" },
        { offer: "100gb", label: "bandwidth" },
        { offer: "20", label: "team members" },
      ],
    },
  ];
  return (
    <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 my-16 md:my-32 gap-4">
      {pricingItems.map(
        ({ heading, description, packge, price, type, ...item }) => {
          return (
            <div
              key={nanoid()}
              className={cn(
                "border p-1 w-full relative space-y-4 h-full origin-bottom backdrop-blur-sm",
              )}
            >
              {type === "main" && (
                <Badge
                  variant="info"
                  size={"lg"}
                  className=" absolute top-0 right-0"
                >
                  <PiAsteriskBold /> popular
                </Badge>
              )}
              <div className="border p-4 grid grid-rows-[1fr_auto_auto] gap-4 h-full">
                <div>
                  <h1
                    className={cn(
                      type === "main"
                        ? "text-2xl font-semibold"
                        : "text-muted-foreground font-medium",
                      " mt-2",
                    )}
                  >
                    {heading}
                  </h1>
                  <h5 className="text-muted-foreground text-xs">
                    {description}
                  </h5>
                  <div className="flex items-end my-4">
                    <h2 className="text-6xl font-semibold">
                      ${year ? price.year : price.month}
                    </h2>
                    <p className="text-2xl text-muted-foreground">
                      /{year ? "year" : "month"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 ">
                  {packge.map((item) => (
                    <div
                      key={nanoid()}
                      className=" grid grid-cols-[auto_1fr] place-items-start text-muted-foreground"
                    >
                      <PiCheckSquare className="size-4.5 mr-2 inline mt-0.5 " />
                      <div className="space-x-1 tracking-wide">
                        {item.offer && <span>{item.offer}</span>}
                        <span>{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full"
                  size={"lg"}
                  variant={type === "main" ? "primary" : "secondary"}
                  onClick={() => item.button.action(heading)}
                >
                  {item.button.label}
                </Button>
              </div>
            </div>
          );
        },
      )}
    </section>
  );
}

export default PricingGrid;
