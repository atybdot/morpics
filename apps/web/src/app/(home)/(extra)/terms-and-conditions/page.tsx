export default function TermsAndConditionsPage() {
  return (
    <section className="prose dark:prose-invert max-w-3xl mx-auto py-12 mb-24">
      <h1 className="text-3xl font-semibold mb-2">Terms of Service</h1>
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
          <h2 className="font-medium mb-3">1. The Gist</h2>
          <p className="text-muted-foreground text-sm text-balance">
            We're not here to trap you in legal loopholes. We just want to
            provide a killer image manipulation API. By using Morpics, you agree
            to play nice and not abuse the service.
          </p>
        </div>

        <div>
          <h2 className="font-medium mb-3">2. Your Images are YOURS</h2>
          <p className="text-muted-foreground mb-2 text-sm font-medium">
            We don't own your images. You do. Period.
          </p>
          <p className="text-muted-foreground text-sm text-balance">
            When you upload files to Morpics, you give us permission to store
            and transform them (resize, blur, format, etc.) so we can deliver
            them to your users. That's it. We will <strong>never</strong> sell
            your images or data to third parties. We're in the business of
            infrastructure, not data brokering.
          </p>
        </div>

        <div>
          <h2 className="font-medium mb-3">3. Where stuff lives</h2>
          <p className="text-muted-foreground text-sm text-balance">
            We use{" "}
            <a
              href="https://www.cloudflare.com/products/r2-storage/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-primary"
            >
              Cloudflare R2
            </a>{" "}
            for storage because it's fast, reliable, and affordable. This means
            your encrypted bits are physically stored on their servers. Since we
            rely on them, their{" "}
            <a
              href="https://www.cloudflare.com/terms/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-primary"
            >
              terms
            </a>{" "}
            and{" "}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-primary"
            >
              privacy policy
            </a>{" "}
            technically apply to the underlying storage too.
          </p>
        </div>

        <div>
          <h2 className="font-medium mb-3">4. Don't be evil</h2>
          <p className="text-muted-foreground mb-2 text-sm font-medium">
            don't use Morpics to host:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm text-balance">
            <li>Illegal content (obviously).</li>
            <li>Malware or anything designed to harm others.</li>
            <li>Content that infringes on someone else's copyright.</li>
          </ul>
          <p className="text-muted-foreground mt-4 text-sm">
            If you do, we'll have to ban you. We are not left with any other
            option
          </p>
        </div>

        <div>
          <h2 className="font-medium mb-3">5. Liability (The "Oops" Clause)</h2>
          <p className="text-muted-foreground text-sm text-balance">
            We work hard to keep Morpics up 24/7 and running smoothly. However,
            software is hard, and things break. We provide this service "as is"
            without any warranties. We aren't liable for any damages if the
            service goes down or if a gremlin eats your pixels (though we have
            backups, so that's unlikely).
          </p>
        </div>

        <div>
          <h2 className="font-medium mb-3">6. Questions?</h2>
          <p className="text-muted-foreground text-sm text-balance">
            If you're unsure about something or just want to say hi, drop us an
            email at{" "}
            <a
              href="mailto:support@morpics.com"
              className="underline underline-offset-4 hover:text-primary"
            >
              support@morpics.com
            </a>
            .
          </p>
        </div>
      </section>
    </section>
  );
}
