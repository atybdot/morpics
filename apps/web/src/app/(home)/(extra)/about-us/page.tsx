import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AboutUsPage() {
  return (
    <section className="prose dark:prose-invert max-w-3xl mx-auto py-12 mb-24">
      <h1 className="text-3xl font-semibold mb-2">About Morpics</h1>
      <p className="text-muted-foreground mb-8">
        Just a dev having fun with pixels.
      </p>

      <section className="space-y-12">
        <div>
          <h2 className="font-medium mb-3">The Origin Story</h2>
          <p className="text-muted-foreground text-sm">
            Morpics didn't start with a VC pitch deck or a grand vision to
            disrupt the industry. It started as a hobby project. I just wanted
            to build an image transformation service because, honestly, I
            thought it would be fun.
          </p>
          <p className="text-muted-foreground text-sm mt-4">
            I was tired of complex setups for simple image resizing tasks. I
            wanted something that felt like magic—just change a URL, and boom,
            optimized image. So, I built it.
          </p>
        </div>

        <div>
          <h2 className="font-medium mb-3">The Team</h2>
          <p className="text-muted-foreground text-sm">
            Right now, Morpics is a one-person show. I write the code, manage
            the servers, and answer the support emails.
          </p>
          <p className="text-muted-foreground text-sm mt-4">
            This means when you reach out, you're talking to the person who
            actually built the thing. It also means I care a lot about making
            sure it works perfectly, because if it breaks, I'm the one waking up
            at 3 AM to fix it.
          </p>
        </div>

        <div>
          <h2 className="font-medium mb-3">Why Morpics?</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm">
            <li>
              <span className="font-medium">It's Simple:</span> No corporate
              bloat. Just a clean API and a type-safe SDK.
            </li>
            <li>
              <span className="font-medium">It's Fast:</span> Powered by modern
              edge tech because nobody likes waiting for images to load.
            </li>
            <li>
              <span className="font-medium">It's Personal:</span> Built with
              passion by a developer, for developers.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-medium mb-3">Join the Journey</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Whether you're building a small blog or the next big thing, I'd love
            for Morpics to be a part of your stack. If you have feedback,
            feature requests, or just want to chat about code, hit me up.
          </p>
          <div className="flex gap-4 not-prose">
            <Link
              href="mailto:support@morpics.com"
              className={cn(buttonVariants({ variant: "primary" }))}
            >
              Contact Me
            </Link>
            <Link
              href="/media-kit"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Media Kit
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
}
