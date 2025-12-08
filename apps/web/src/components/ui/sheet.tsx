import { Dialog as SheetPrimitive } from "@base-ui-components/react/dialog";
import * as React from "react";
import { PiArrowLineRight, PiSquare, PiX, PiXSquare } from "react-icons/pi";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  if (!children) {
    return (
      <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[open]:bg-secondary w-fit opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
        <PiXSquare className="size-5" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    );
  }
  return (
    <SheetPrimitive.Close
      data-slot="sheet-action"
      className={cn(
        !props.render && buttonVariants({ variant: "outline" }),
        className,
      )}
      {...props}
    />
  );
}

function SheetAction({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return (
    <SheetPrimitive.Close
      data-slot="sheet-close"
      className={cn(!props.render && buttonVariants(), className)}
      {...props}
    />
  );
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetBackdrop({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Backdrop>) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:animation-duration-[300ms] data-[open]:fade-in-0 fixed inset-0 z-50  backdrop-blur-xs brightness-80 ",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  showClose = true,
  side = "right",
  showBackdrop = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Popup> & {
  side?: "top" | "right" | "bottom" | "left";
  showClose?: boolean;
  showBackdrop?: boolean;
}) {
  return (
    <SheetPortal>
      {showBackdrop && <SheetBackdrop />}
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          "data-[open]:animate-in data-[closed]:animate-out fixed z-50 flex flex-col gap-4 transition ease-in-out data-[closed]:duration-300 data-[open]:duration-500 backdrop-blur-xl bg-background",
          side === "right" &&
            "data-[closed]:slide-out-to-right data-[open]:slide-in-from-right inset-y-2 right-2 w-3/4 sm:max-w-sm border ",
          side === "left" &&
            "data-[closed]:slide-out-to-left data-[open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[closed]:slide-out-to-top data-[open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[closed]:slide-out-to-bottom data-[open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[open]:bg-secondary absolute top-4 right-4 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
            <PiXSquare className="size-5" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-body"
      className={cn("px-4 py-2.5", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("flex sm:space-x-2.5 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetAction,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
