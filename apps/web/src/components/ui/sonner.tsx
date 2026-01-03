"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group rounded-none"
      toastOptions={{
        style: {
          borderRadius: "var(--radius)",
        },
        closeButton: true,
        cancelButtonStyle: { borderRadius: "var(--radius)" },
        classNames: { closeButton: "rounded-none" },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          borderRadius: "none",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
