import { useMutation } from "@tanstack/react-query";
import { LoaderIcon, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "../ui/button";

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
  const mutation = useMutation({
    mutationFn: () =>
      authClient.signIn.social({
        provider,
        callbackURL: `${window.location.origin}/dashnoard/orgs/`,
        requestSignUp: signup,
        newUserCallbackURL: `${window.location.origin}/orgs/new`,
      }),

    mutationKey: [`${provider}-login`],
    onError: (e) => {
      console.error(e);
      toast.error(e.message ?? "something went wrong", {
        action: (
          <Button
            size={"sm"}
            variant={mutation.isSuccess ? "success" : "outline"}
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
      variant={mutation.isSuccess ? "success" : variant}
      className={cn("w-full rounded-xl")}
      size="lg"
      disabled={disabled || mutation.isPending}
      onClick={() => !disabled && mutation.mutate()}
      {...props}
    >
      {mutation.isPending || mutation.isSuccess ? (
        <LoaderIcon className="animate-spin" />
      ) : null}
      {mutation.isSuccess ? <span>Redirecting...</span> : <span>{text}</span>}
    </Button>
  );
}

export default button;
