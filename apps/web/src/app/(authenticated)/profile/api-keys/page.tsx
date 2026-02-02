"use client";
// import ApiKeyManager from "@/components/forms/api-key-manager";

import { CardAlt, CardContentAlt } from "@/components/ui/card";

function Page() {
  return (
    <>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold mt-4">API Keys</h1>
        <p className="text-muted-foreground">Manage your API keys for accessing the platform</p>
      </div>
      <section className="space-y-6">
        <CardAlt outer>
          <CardContentAlt className="border">
            <div className=" aspect-video content-center text-center text-3xl text-muted-foreground">
              Coming soon...
            </div>
            {/* <ApiKeyManager /> */}
          </CardContentAlt>
        </CardAlt>
      </section>
    </>
  );
}

export default Page;
