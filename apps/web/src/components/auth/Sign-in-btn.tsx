import { useMutation } from "@tanstack/react-query";
import { LoaderIcon, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button, type ButtonProps } from "../ui/button";

function prepareURL(new_user = false) {
  const url = new URL(window.location.href);
  const toRedirect = url.searchParams.get("redirect");

  const slug = url.searchParams.get("slug");
  const newRedirect = new_user ? "/buckets/new" : "/dashboard";

  if (toRedirect === null) {
    url.pathname = newRedirect;
    return url.toString();
  }

  url.pathname = "/checkout";
  const params = new URLSearchParams({
    slug: slug || "",
    redirect: newRedirect,
  });
  url.search = params.toString();
  return url.toString();
}

function button({
  text,
  signup,
  provider,
  variant,
  disabled,
  ...props
}: {
  provider: "google" | "github";
  text: string;
  signup: boolean;
} & ButtonProps) {
  const [success, setSuccess] = useState<"success" | "error">();

  const mutation = useMutation({
    mutationFn: () =>
      authClient.signIn.social({
        provider,
        callbackURL: prepareURL(),
        requestSignUp: signup,
        newUserCallbackURL: prepareURL(true),
      }),

    mutationKey: [`${provider}-login`],
    onSuccess: (ctx) => {
      if (ctx.error) {
        setSuccess("error");
        toast.error(ctx.error.message, {
          action: { label: "retry", onClick: () => mutation.mutate() },
        });
      } else {
        setSuccess("success");
      }
    },
    onError: (e) => {
      console.error(e);
      toast.error(e.message ?? "something went wrong", {
        action: (
          <Button
            size={"sm"}
            variant={success === "success" ? "success" : "outline"}
            className="mt-auto"
            onClick={() => {
              toast.dismiss();

              mutation.mutate();
            }}
          >
            <RotateCcw />
            Retry
          </Button>
        ),
        closeButton: true,
        classNames: {
          icon: "mb-auto mt-1 ",
          content: "flex-4 font-semibold w-full",
        },

        description: "see browser console for more information",
      });
    },
  });
  const lastUsed = authClient.isLastUsedLoginMethod(provider);

  return (
    <Button
      variant={success === "success" ? "success" : variant}
      className={cn("w-full relative")}
      size="lg"
      disabled={disabled || mutation.isPending}
      onClick={() => !disabled && mutation.mutate()}
      {...props}
    >
      {mutation.isPending || success === "success" ? <LoaderIcon className="animate-spin" /> : null}
      {success === "success" ? (
        <span>Redirecting...</span>
      ) : (
        <>
          <span>{text}</span>
          {lastUsed ? (
            <Badge
              variant="success"
              size={"xs"}
              className="font-light mb-0 absolute top-0 right-0 "
            >
              last used
            </Badge>
          ) : null}
        </>
      )}
    </Button>
  );
}

export default button;
