import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import img from "./bg.png";
import SignIn from "./sign-in";

async function Page() {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });
  if (session?.session) {
    return redirect("/dashboard");
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-screen gap-2 p-2">
      <SignIn />
      <div className="p-1 h-full p-full lg:col-span-2 relative overflow-hidden hidden md:block">
        {/** biome-ignore lint/performance/noImgElement: <explanation> */}
        <img
          src={img.src}
          className=" absolute inset-0 left-0 top-0 object-cover w-full h-full invert dark:invert-0 brightness-50"
        />
      </div>
    </section>
  );
}

export default Page;
