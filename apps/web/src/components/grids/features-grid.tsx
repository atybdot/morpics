"use client";
import { nanoid } from "nanoid";
import type { ElementType } from "react";
import { cn } from "@/lib/utils";
import { CogIcon } from "../animate-ui/icons/cog";
import { GaugeIcon } from "../animate-ui/icons/gauge";
import { AnimateIcon } from "../animate-ui/icons/icon";
import { Orbit } from "../animate-ui/icons/orbit";
import { SlidersHorizontal } from "../animate-ui/icons/sliders-horizontal";
import { SparklesIcon } from "../animate-ui/icons/sparkles";
import { UnplugIcon } from "../animate-ui/icons/unplug";

interface GridItems {
  h1: string;
  p: string;
  icon: ElementType;
  className?: {
    wrapper?: string;
    h1?: string;
    p?: string;
    icon?: string;
  };
}
function FeaturesGrid() {
  const gridItems: GridItems[] = [
    {
      h1: "transformations",
      p: "Crop, resize, rotate, and reshape with precise, intuitive controls",
      icon: SlidersHorizontal,
    },
    {
      h1: "optimizations",
      p: "Automatic tuning for fast, lightweight delivery",
      icon: CogIcon,
    },
    {
      h1: "AI Editing",
      p: "Remove backgrounds, autofill, and enhance images in a single request",
      icon: SparklesIcon,
    },
    {
      h1: "Speed",
      p: "Engineered for millisecond-level performance",
      icon: GaugeIcon,
    },
    {
      h1: "Integration",
      p: "Seamlessly connect with your existing tools and workflows",
      icon: UnplugIcon,
    },
    {
      h1: "Format Conversion",
      p: "Convert between WebP, AVIF, PNG, JPEG and more with automatic quality preservation",
      icon: Orbit,
    },
  ];
  return (
    <>
      {gridItems.map(({ className, ...item }) => (
        <AnimateIcon
          key={nanoid()}
          asChild
          animateOnHover
          loop
          animation="default-loop"
        >
          <div
            className={cn(
              "bg-background relative content-end p-4 pt-16",
              className?.wrapper,
            )}
          >
            <item.icon className={cn("mb-2", className?.icon)} />
            <h1 className={cn("mb-1", className?.h1)}>{item.h1}</h1>
            <p className={cn("text-sm text-muted-foreground", className?.p)}>
              {item.p}
            </p>
          </div>
        </AnimateIcon>
      ))}
    </>
  );
}

export default FeaturesGrid;
