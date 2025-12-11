import { useIsMobile } from "@/hooks/use-mobile";
import React from "react";
import { Button, type ButtonProps } from "../ui/button";
import { useRouter } from "next/navigation";
import { PiArrowLeft } from "react-icons/pi";
import { cn } from "@/lib/utils";

function GoBackBtn({
  btn,
  divProps,
  ...props
}: {
  divProps?: React.HTMLAttributes<HTMLDivElement>;
  btn?: ButtonProps;
  href?: Pick<HTMLAnchorElement, "href">["href"];
}) {
  const isMobile = useIsMobile();
  const router = useRouter();
  return (
    <div
      {...divProps}
      className={cn(
        "col-span-full flex items-center justify-between",
        divProps?.className,
      )}
    >
      <Button
        {...btn}
        size={btn?.size ? btn.size : isMobile ? "xs" : "sm"}
        variant={btn?.variant ? btn.variant : "dim"}
        onClick={
          btn?.onClick
            ? btn.onClick
            : () => {
                props?.href ? router.push(props.href as any) : router.back();
              }
        }
      >
        <PiArrowLeft /> Go back
      </Button>
    </div>
  );
}

export default GoBackBtn;
