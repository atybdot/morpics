"use client";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";
import UplaodSections from "@/components/forms/file-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { PiArrowLeft } from "react-icons/pi";
import GoBackBtn from "@/components/elements/go-back-btn";

function Page() {
  const { data: session, isPending } = authClient.useSession();
  useEffect(() => {
    if (!isPending) {
      if (!session?.session.activeOrganizationId) {
        redirect("/buckets");
      }
    }
  }, [isPending]);
  const isMobile = useIsMobile();
  const router = useRouter();
  return (
    <section className="h-full w-full flex items-center flex-col justify-center relative">
      <GoBackBtn divProps={{ className: "  absolute left-0 top-0" }} />

      {isPending ? (
        <Skeleton className="w-2/3 h-10/12 my-auto" />
      ) : (
        session?.session && (
          <UplaodSections
            onFilesChange={(e) => {
              console.log("[FROM Upload FIles]: ", e);
            }}
            reqMetadata={{
              orgId: session.session.activeOrganizationId as string,
              userId: session.session.userId,
            }}
            maxFiles={50}
          />
        )
      )}
    </section>
  );
}

export default Page;
