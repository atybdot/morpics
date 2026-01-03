"use client";
import { Suspense } from "react";
import { PiShoppingBagOpen } from "react-icons/pi";
import GoBackBtn from "@/components/elements/go-back-btn";
import NewBucketForm from "@/components/forms/create-new-bucket";
import Loader from "@/components/loader";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <div className="flex items-center justify-center h-full relative">
        <GoBackBtn
          href="/buckets"
          divProps={{
            className:
              " absolute flex items-center justify-between top-0 left-0",
          }}
        />
        <Card className="w-full max-w-sm p-2">
          <CardContent className="border w-full px-6 py-10 pt-14">
            <div className="flex flex-col items-center space-y-4 text-muted-foreground">
              <PiShoppingBagOpen className="size-12" />

              <div className="space-y-2 text-center">
                <h1 className="text-xl font-semibold text-foreground">
                  create new Bucket
                </h1>
                <p className="text-muted-foreground text-sm text-pretty">
                  Buckets are a way to group your images.
                </p>
              </div>
              <NewBucketForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </Suspense>
  );
}
