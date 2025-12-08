import { useMutation } from "@tanstack/react-query";
import { LoaderIcon, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "../ui/button";
import { useState } from "react";

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
        callbackURL: `${window.location.origin}/dashboard`,
        requestSignUp: signup,
        newUserCallbackURL: `${window.location.origin}/buckets/new`,
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
  return (
    <Button
      variant={success === "success" ? "success" : variant}
      className={cn("w-full")}
      size="lg"
      disabled={disabled || mutation.isPending}
      onClick={() => !disabled && mutation.mutate()}
      {...props}
    >
      {mutation.isPending || success === "success" ? (
        <LoaderIcon className="animate-spin" />
      ) : null}
      {success === "success" ? (
        <span>Redirecting...</span>
      ) : (
        <span>{text}</span>
      )}
    </Button>
  );
}

export default button;
