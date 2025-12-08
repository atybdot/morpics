"use client";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import UplaodSections from "@/components/file-upload/file-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

function Page() {
  const { data: session, isPending } = authClient.useSession();
  useEffect(() => {
    if (!isPending) {
      if (!session?.session.activeOrganizationId) {
        redirect("/buckets");
      }
    }
  }, [isPending]);

  return (
    <section className="h-full w-full flex items-start justify-center">
      {isPending ? (
        <Skeleton className="w-1/3 h-1/4 my-auto" />
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
