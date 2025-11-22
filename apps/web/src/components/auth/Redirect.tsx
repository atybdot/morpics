"use client";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";

function Redirect({
  redirect,
  text,
  status,
}: {
  redirect?: string;
  text: string | React.ReactNode;
  status: number;
}) {
  const router = useRouter();

  const handleRedirect = () => {
    router.replace(redirect as any);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleRedirect();
    }, 5000);
    () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center h-full space-y-4">
      <h1 className="text-4xl font-semibold text-center">{status}</h1>
      {text}
      <Button onClick={handleRedirect} size={"lg"} variant={"secondary"}>
        <Loader className="animate-spin" />
        Redirecting...
      </Button>
    </div>
  );
}

export default Redirect;
