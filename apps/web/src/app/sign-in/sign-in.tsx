"use client";

import { ChevronLeft, SquareDashedMousePointerIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import SignInBtn from "@/components/auth/Sign-in-btn";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SignIn() {
  const [signup, setSignup] = useState(true);
  return (
    <div className="flex items-center justify-start relative h-full px-12 border">
      <div aria-hidden className="-z-10 absolute inset-0 isolate opacity-60 contain-strict">
        <div className="-translate-y-87.5 absolute top-0 right-0 h-320 w-140 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]" />
        <div className="absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] [translate:5%_-50%]" />
        <div className="-translate-y-87.5 absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]" />
      </div>
      <Link
        href={"/"}
        className={cn(buttonVariants({ variant: "dim" }), " absolute right-0 top-0")}
      >
        <ChevronLeft />
        go back
      </Link>
      <div className="flex flex-col items-start space-y-8 pointer-events-auto max-w-sm mx-auto">
        <SquareDashedMousePointerIcon className="size-20 stroke-1" />

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            {signup ? "Create new Account" : "Welcome back!"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {signup ? "Already have an account?" : "First time here?"}{" "}
            <Button
              variant={"ghost"}
              size={"md"}
              underline={"solid"}
              mode={"link"}
              className="text-foreground hover:underline underline-offset-2"
              onClick={() => setSignup((p) => !p)}
            >
              {signup ? "Login here" : "sign-up here"}
            </Button>
          </p>
        </div>

        <div className="w-full space-y-4">
          <SignInBtn
            variant={"primary"}
            provider="github"
            signup={signup}
            text={`${signup ? "Sign up " : "Sign in "} using github`}
          />
          <SignInBtn
            variant={"secondary"}
            provider="google"
            signup={signup}
            text={`${signup ? "Sign up " : "Sign in "} using google`}
          />
        </div>

        <p className="text-center text-xs w-11/12 text-muted-foreground">
          You acknowledge that you read, and agree, to our{" "}
          <a href="terms-and-conditions" className="underline hover:text-foreground">
            Terms of Service
          </a>{" "}
          and our{" "}
          <a href="privacy-policy" className="underline hover:text-foreground">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
