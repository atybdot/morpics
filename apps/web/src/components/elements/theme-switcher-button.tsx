"use client";
import { useTheme } from "next-themes";
import { useQueryState } from "nuqs";
import type React from "react";
import { type SVGProps, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeSwitcherButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function ThemeSwitcherButton({ className, ...props }: ThemeSwitcherButtonProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeQuery] = useQueryState("theme", {
    defaultValue: resolvedTheme || "light",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="dim" size="icon" disabled className={className}>
        <div className=" bg-input animate-pulse" />
      </Button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    setThemeQuery(theme);
  };

  return (
    <Button
      variant="dim"
      size="icon"
      onClick={toggleTheme}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <IconParkOutlineContrastViewCircle
        className={"size-3.5 transition-all duration-300 rotate-180"}
      />

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function IconParkOutlineContrastViewCircle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48" {...props}>
      <g fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="4">
        <path
          strokeLinecap="round"
          d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20z"
          clipRule="evenodd"
        />
        <path d="M24 4c11.046 0 20 8.954 20 20s-8.954 20-20 20z" />
        <path strokeLinecap="round" d="M24 36H9m15-8H5m19-8H5m19-8H9" />
      </g>
    </svg>
  );
}
