"use client";

import { Accordion } from "@base-ui-components/react/accordion";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { PiCaretDown, PiMinus, PiPlus } from "react-icons/pi";
import { cn } from "@/lib/utils";

// Variants
const accordionRootVariants = cva("", {
  variants: {
    variant: {
      default: "",
      outline: "space-y-2",
      solid: "space-y-2",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const accordionItemVariants = cva("", {
  variants: {
    variant: {
      default: "border-b border-border",
      outline: "border border-border rounded-lg px-4",
      solid: "rounded-lg bg-accent/70 px-4",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const accordionHeaderVariants = cva("flex", {
  variants: {
    variant: {
      default: "",
      outline: "",
      solid: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const accordionTriggerVariants = cva(
  "flex flex-1 items-center justify-between py-4 gap-2.5 text-foreground font-medium transition-all group cursor-pointer text-left",
  {
    variants: {
      variant: {
        default: "",
        outline: "",
        solid: "",
      },
      indicator: {
        arrow: "group-data-[panel-open]:[&>svg]:rotate-180",
        plus: "",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      indicator: "arrow",
    },
  },
);

const accordionPanelVariants = cva(
  "h-[var(--accordion-panel-height)] overflow-hidden text-sm text-accent-foreground transition-[height] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-100 data-[ending-style]:h-0 data-[starting-style]:h-0 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
  {
    variants: {
      variant: {
        default: "",
        outline: "",
        solid: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// Context
type AccordionContextType = {
  variant?: "default" | "outline" | "solid";
  indicator?: "arrow" | "plus" | "none";
};

const AccordionContext = React.createContext<AccordionContextType>({
  variant: "default",
  indicator: "arrow",
});

// Base UI Accordion Root
interface AccordionRootProps
  extends React.ComponentProps<typeof Accordion.Root>,
    VariantProps<typeof accordionRootVariants> {
  indicator?: "arrow" | "plus" | "none";
}

function AccordionRoot(props: AccordionRootProps) {
  const {
    className,
    variant = "default",
    indicator = "arrow",
    children,
    ...rest
  } = props;

  return (
    <AccordionContext.Provider
      value={{ variant: variant || "default", indicator }}
    >
      <Accordion.Root
        data-slot="accordion"
        className={cn(accordionRootVariants({ variant }), className)}
        {...rest}
      >
        {children}
      </Accordion.Root>
    </AccordionContext.Provider>
  );
}

// Base UI Accordion Item
function AccordionItem(props: React.ComponentProps<typeof Accordion.Item>) {
  const { className, children, ...rest } = props;
  const { variant } = React.useContext(AccordionContext);

  return (
    <Accordion.Item
      data-slot="accordion-item"
      className={cn(accordionItemVariants({ variant }), className)}
      {...rest}
    >
      {children}
    </Accordion.Item>
  );
}

// Base UI Accordion Header
function AccordionHeader(props: React.ComponentProps<typeof Accordion.Header>) {
  const { className, children, ...rest } = props;
  const { variant } = React.useContext(AccordionContext);

  return (
    <Accordion.Header
      data-slot="accordion-header"
      className={cn(accordionHeaderVariants({ variant }), className)}
      {...rest}
    >
      {children}
    </Accordion.Header>
  );
}

// Base UI Accordion Trigger
function AccordionTrigger(
  props: React.ComponentProps<typeof Accordion.Trigger>,
) {
  const { className, children, ...rest } = props;
  const { variant, indicator } = React.useContext(AccordionContext);

  return (
    <Accordion.Trigger
      data-slot="accordion-trigger"
      className={cn(
        accordionTriggerVariants({ variant, indicator }),
        className,
      )}
      {...rest}
    >
      {children}
      {indicator === "plus" && (
        <div className="relative size-4 shrink-0">
          <PiPlus
            className="absolute inset-0 size-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-panel-open:opacity-0 group-data-panel-open:rotate-180"
            strokeWidth={1}
          />
          <PiMinus
            className="absolute inset-0 size-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-0 rotate-90 group-data-panel-open:opacity-100 group-data-panel-open:rotate-180"
            strokeWidth={1}
          />
        </div>
      )}
      {indicator === "arrow" && (
        <PiCaretDown
          className="size-4 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          strokeWidth={1}
        />
      )}
    </Accordion.Trigger>
  );
}

// Base UI Accordion Panel
function AccordionPanel(props: React.ComponentProps<typeof Accordion.Panel>) {
  const { className, children, ...rest } = props;
  const { variant } = React.useContext(AccordionContext);

  return (
    <Accordion.Panel
      data-slot="accordion-panel"
      className={cn(accordionPanelVariants({ variant }), className)}
      {...rest}
    >
      <div className={cn("pb-5 pt-0")}>{children}</div>
    </Accordion.Panel>
  );
}

// Exports with proper naming to match Base UI pattern
export {
  AccordionRoot as Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionPanel,
};
