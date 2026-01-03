"use client";

import type React from "react";
import { PiMonitor, PiMoonStars, PiSun } from "react-icons/pi";
import { useTheme } from "@/hooks/use-theme";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface ThemeSwitcherMultiButtonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function ThemeSwitcherMultiButton({
  className,
  ...props
}: ThemeSwitcherMultiButtonProps) {
  const { setTheme, theme } = useTheme();

  const themes = [
    { value: "light", icon: PiSun, label: "Switch to light theme" },
    { value: "dark", icon: PiMoonStars, label: "Switch to dark theme" },
    { value: "system", icon: PiMonitor, label: "Switch to system theme" },
  ];

  return (
    <div
      className={cn(
        "relative isolate inline-flex items-center w-fit",
        className,
      )}
      {...props}
    >
      {themes.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          aria-label={label}
          title={label}
          type="button"
          size={"icon"}
          variant={"ghost"}
          onClick={() => setTheme(value)}
          className="group relative transition duration-200 ease-out size-6"
        >
          <Icon
            className={`relative m-auto size-4 transition duration-200 ease-out ${
              theme === value
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground focus-visible:text-foreground"
            }`}
            aria-hidden="true"
          />
        </Button>
      ))}
    </div>
  );
}
