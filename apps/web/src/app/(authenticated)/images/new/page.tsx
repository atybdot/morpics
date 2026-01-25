"use client";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import GoBackBtn from "@/components/elements/go-back-btn";
import UploadSection from "@/components/forms/file-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

function Page() {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session?.session?.activeOrganizationId) {
      redirect("/buckets");
    }
  }, [isPending, session?.session?.activeOrganizationId]);
  return (
    <section className="h-full w-full flex items-center flex-col justify-center">
      <GoBackBtn divProps={{ className: "w-full" }} />

      {isPending ? (
        <Skeleton className="w-2/3 h-10/12 my-auto" />
      ) : (
        session?.session && (
          <UploadSection
            reqMetadata={{
              bucketId: session.session.activeOrganizationId as string,
              bucket: session.activeOrg?.slug as string,
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
