"use client";
import { useSearchParams } from "next/navigation";
import React from "react";
import { toast } from "sonner";

export default function ToasterExtractor({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const info = useSearchParams().get("info");
  const error = useSearchParams().get("error");
  const success = useSearchParams().get("success");

  React.useEffect(() => {
    if (info) {
      toast.info(decodeURIComponent(info));
    }
    if (error) {
      toast.error(decodeURIComponent(error));
    }
    if (success) {
      toast.success(decodeURIComponent(success));
    }
  }, [info, error, success]);
  return children;
}
