import type { Metadata } from "next";
// export const SITE_URL = "https://mor.pics";
export const SITE_URL = "http://localhost:3001";
export const siteMetadata: Metadata = {
  generator: "Next.js",
  applicationName: "Morpics",
  referrer: "origin-when-cross-origin",
  title: {
    default: "Morpics - URL Powered Image Manipulation Service",
    template: "%s | Morpics",
  },
  description:
    "Transform images instantly with just a URL. Resize, compress, optimize, and manipulate images on the fly. Simple API, type-safe SDK, edge-fast performance. Built for developers who hate complex setups.",
  keywords: [
    "image manipulation",
    "image transformation",
    "image optimization",
    "image resizing",
    "url powered images",
    "image cdn",
    "image processing api",
    "developer tools",
    "edge computing",
    "cloudflare r2",
    "image compression",
    "image format conversion",
    "webp converter",
    "avif converter",
    "lazy loading",
    "responsive images",
    "image hosting",
    "serverless images",
    "edge image optimization",
  ],
  authors: [{ name: "atyb a.", url: "https://atyb.me" }],
  creator: "@atybdot",
  publisher: "Morpics",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-US": SITE_URL,
      "en-IN": SITE_URL,
      en: SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: "Morpics - URL Powered Image Manipulation",
    description:
      "Transform images instantly with just a URL. Resize, compress, optimize, and manipulate images on the fly. Simple API, edge-fast performance.",
    siteName: "Morpics",
    images: [
      {
        url: "/open-graph.png",
        width: 1200,
        height: 630,
        alt: "Morpics - URL Powered Image Manipulation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Morpics - URL Powered Image Manipulation",
    description:
      "Transform images instantly with just a URL. Resize, compress, optimize, and manipulate images on the fly.",
    creator: "@atybdot",
    site: "@morpics",
    images: [
      {
        url: "/open-graph.png",
        alt: "Morpics - URL Powered Image Manipulation",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "16x16", type: "image/x-icon" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],

    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json",
  verification: {
    google: "SAdl1D2sGJ5Adprq5Uzzq0kitACH0gOUeF4jmHlGDjg",
  },
  pinterest: {
    richPin: true,
  },
  category: "technology",
};

export const schemaLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Morpics",
  description:
    "Transform images instantly with just a URL. Resize, compress, optimize, and manipulate images on the fly. Simple API, type-safe SDK, edge-fast performance.",
  url: SITE_URL,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    {
      "@type": "Offer",
      price: "8",
      priceCurrency: "USD",
    },
    {
      "@type": "Offer",
      price: "20",
      priceCurrency: "USD",
    },
  ],
  author: {
    "@type": "Person",
    name: "atyb a.",
    url: "https://github.com/atybdot",
  },
  featureList: [
    "Image resizing",
    "Image compression",
    "Format conversion (WebP, AVIF, PNG, JPEG)",
    "URL-based transformations",
    "Edge caching",
    "Type-safe SDK",
    "Simple REST API",
  ],
};
