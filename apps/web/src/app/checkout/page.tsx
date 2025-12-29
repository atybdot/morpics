import { authClient } from "@/lib/auth-client";
import { userTier, type UserTier } from "@morpics/db/schema/constants";

import { redirect } from "next/navigation";

import z from "zod";
import { headers } from "next/headers";

const schema = z.object({
  slug: z.enum(userTier),
});
async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] }>;
}) {
  const slug = (await searchParams)?.slug as UserTier;
  const returnPath = ((await searchParams)?.redirect ?? "/dashboard") as string;
  const h = await headers();
  const returnUrl = new URL(
    returnPath,
    `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`,
  );
  const { error, data } = schema.safeParse({ slug });
  if (error || !slug) {
    throw redirect("/pricing?error='invalid_query_params'");
  }

  const { data: session } = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  });
  if (!session?.user) {
    const url = encodeURI(`/sign-in?redirect=/checkout&slug=${data.slug}}`);
    return redirect(url as any);
  }
  switch (session?.user.activeTier as UserTier) {
    case "free":
      if (slug === "free") {
        return redirect("/dashboard?info='choose_higher_plan'");
      }
      break;
    case "starter":
      if (slug !== "pro") {
        return redirect("/dashboard?info='choose_higher_plan'");
      }
      break;
    case "pro":
      return redirect("/dashboard?info='already_at_the_highest_plan'");
    default:
  }

  const { error: dodoError, data: checkout } =
    await authClient.dodopayments.checkoutSession(
      {
        slug: data.slug,
        referenceId: session?.user.id,
        return_url: returnUrl.toString() as string,
      },
      { headers: await headers() },
    );

  if (dodoError) {
    console.log(dodoError);

    return redirect(`/dashboard?error=${encodeURI(dodoError.message ?? "")}` as any);
  }
  if (checkout.redirect && checkout.url) {
    throw redirect(checkout.url as any);
  }
}
export default Page;
