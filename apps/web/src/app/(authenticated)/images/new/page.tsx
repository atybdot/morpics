import { headers } from "next/headers";
import { redirect } from "next/navigation";
import GoBackBtn from "@/components/elements/go-back-btn";
import UploadSection from "@/components/forms/file-upload";
import { checkSession } from "@/lib/auth-utils";

async function Page() {
  const { session } = await checkSession({ headers });

  if (!session?.session?.activeOrganizationId) {
    redirect("/buckets");
  }

  return (
    <section className="h-full w-full flex items-center flex-col justify-center">
      <GoBackBtn divProps={{ className: "w-full" }} />
      <UploadSection
        reqMetadata={{
          bucketId: session.session.activeOrganizationId,
          bucket: session.activeOrg?.slug as string,
          userId: session.session.userId,
        }}
        maxFiles={50}
      />
    </section>
  );
}

export default Page;
