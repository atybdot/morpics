export default function PrivacyPolicyPage() {
  return (
    <section className="prose dark:prose-invert max-w-3xl mx-auto py-12 mb-24">
      <h1 className="text-3xl font-semibold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Last updated:{" "}
        {new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <section className="space-y-12">
        <div>
          <h2 className="font-medium mb-3">1. The Basics</h2>
          <p className="text-muted-foreground text-sm">
            We collect the bare minimum data needed to make Morpics work. We
            don't sell your data. We don't track you across the web. We're just
            shipping code.
          </p>
        </div>

        <div>
          <h2 className="font-medium mb-3">2. What we actually collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm text-balance">
            <li>
              <span className="font-medium">Your Identity:</span> Just your name
              and email so you can log in.
            </li>
            <li>
              <span className="font-medium">Your Images:</span> Obviously, we
              need to process the images you upload. We store them on{" "}
              <span className="font-medium">Cloudflare R2</span>.
            </li>
            <li>
              <span className="font-medium">Telemetry:</span> We track anonymous
              usage data (like "how many people resized an image today") to help
              us improve. We don't spy on your specific workflows.
            </li>
            <li>
              <span className="font-medium">Logs:</span> Standard server logs
              (IPs, browser agents) for debugging and security.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-medium mb-3">3. How we use it</h2>
          <p className="text-muted-foreground text-sm mb-2">
            Solely to provide the service:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm">
            <li>To transform and deliver your images.</li>
            <li>To keep your account secure.</li>
            <li>To fix bugs when things crash.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-medium mb-3">
            4. Third Parties (The "Who else sees this?")
          </h2>
          <p className="text-muted-foreground text-sm mb-2">
            We rely on a few giants to keep the lights on:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm">
            <li>
              <span className="font-medium">Cloudflare R2:</span> For storing
              your images securely.
            </li>
            <li>
              <span className="font-medium">Vercel & Cloudflare workers:</span>{" "}
              For hosting our API and frontend.
            </li>
            <li>
              <span className="font-medium">Neondb:</span> For storing data.
            </li>
            <li>
              <span className="font-medium">posthog:</span> For user telemetry
              and analytics.
            </li>
            <li>
              <span className="font-medium">axiom:</span> For technical logs and
              monitoring.
            </li>
          </ul>
          <p className="text-muted-foreground text-sm mt-4">
            They have their own privacy policies, which you can read if you're
            into that sort of thing.
          </p>
        </div>

        <div>
          <h2 className="font-medium mb-3">5. Security</h2>
          <p className="text-muted-foreground text-sm">
            We use industry-standard encryption (HTTPS/TLS). We don't store
            passwords in plain text (we're not monsters). However, no system is
            100% secure, so if you find a bug, please let us know responsibly.
          </p>
        </div>

        <div>
          <h2 className="font-medium mb-3">6. Contact</h2>
          <p className="text-muted-foreground text-sm">
            Questions? Concerns? Want to say hi? Send it to{" "}
            <a
              href="mailto:support@mor.pics"
              className="underline underline-offset-4 hover:text-primary"
            >
              support@mor.pics
            </a>
            .
          </p>
        </div>
      </section>
    </section>
  );
}
