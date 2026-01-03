import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { AIStructuredData } from "@/components/elements/ai-structured-data";
import { SchemaLd } from "@/components/elements/schema-ld";
import { siteMetadata } from "@/components/elements/site-metadata";
import Providers from "@/components/providers";
import "../index.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = siteMetadata;
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <SchemaLd />
        <AIStructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable}  ${interSans.variable}  antialiased bg-background text-foreground mx-auto w-full relative`}
      >
        <Providers>
          <div
            className="fixed inset-0 -z-5 h-ful"
            style={{
              backgroundImage: `
        linear-gradient(to right,var(--color-muted) 1px, transparent 1px),
        linear-gradient(to bottom, var(--color-secondary) 1px, transparent 1px)
      `,
              backgroundSize: "40px 40px",
              backgroundPosition: "0 0, 0 0",
              maskImage: `
        repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)
      `,
              WebkitMaskImage: `
  repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)
      `,
              maskComposite: "intersect",
              WebkitMaskComposite: "source-in",
            }}
          />

          {children}
        </Providers>
      </body>
    </html>
  );
}
