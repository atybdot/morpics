import { SITE_URL } from "./site-metadata";

export const aiDiscoverabilityData = {
  "@context": "https://schema.org",
  "@type": "WebAPI",
  name: "Morpics API",
  description:
    "A URL-powered image manipulation API that allows developers to transform, resize, compress, and optimize images on the fly. Perfect for web and mobile applications.",
  url: "https://docs.mor.pics",
  documentation: "https://docs.mor.pics",
  provider: {
    "@type": "Organization",
    name: "Morpics",
    url: SITE_URL,
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@mor.pics",
      contactType: "customer service",
    },
  },
  applicationCategory: "Image Processing",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free tier available with premium options",
  },
  capabilities: [
    {
      "@type": "PropertyValue",
      name: "Image Resizing",
      description: "Resize images to any dimensions while maintaining aspect ratio",
    },
    {
      "@type": "PropertyValue",
      name: "Format Conversion",
      description: "Convert between WebP, AVIF, PNG, JPEG, and other formats",
    },
    {
      "@type": "PropertyValue",
      name: "Image Compression",
      description: "Compress images to reduce file size without quality loss",
    },
    {
      "@type": "PropertyValue",
      name: "URL-Based Transformations",
      description: "Apply transformations directly via URL parameters",
    },
    {
      "@type": "PropertyValue",
      name: "Edge Delivery",
      description: "Global CDN delivery with Cloudflare R2",
    },
  ],
  sdks: [
    {
      "@type": "SoftwareApplication",
      name: "TypeScript SDK",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "JavaScript",
      description: "Type-safe SDK for TypeScript/JavaScript projects",
    },
    {
      "@type": "SoftwareApplication",
      name: "REST API",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      description: "Simple RESTful API for HTTP requests",
    },
  ],
  examples: [
    {
      "@type": "SoftwareSourceCode",
      name: "Basic Resize Example",
      codeUrl: `${SITE_URL}/playground`,
      programmingLanguage: "TypeScript",
      text: "const url = 'https://cdn.mor.pics/bucket/image.jpg?w=800&h=600&fit=crop'",
    },
  ],
  keywords: [
    "image api",
    "image transformation",
    "image processing",
    "image optimization",
    "cdn images",
    "developer api",
    "serverless images",
    "edge computing",
    "image hosting",
  ],
  inLanguage: ["en"],
  audience: {
    "@type": "Audience",
    audienceType: "Developers",
  },
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Morpics?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Morpics is a URL-powered image manipulation service that allows you to transform, resize, compress, and optimize images instantly by modifying URLs. No complex setup required.",
      },
    },
    {
      "@type": "Question",
      name: "How does URL-based image manipulation work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Simply append transformation parameters to your image URL. For example: your-image.jpg?w=800&h=600&fit=crop will resize the image to 800x600 pixels.",
      },
    },
    {
      "@type": "Question",
      name: "Is Morpics free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Morpics offers a free tier with generous limits. Premium plans are available for higher usage and advanced features.",
      },
    },
    {
      "@type": "Question",
      name: "What image formats are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Morpics supports all major image formats including WebP, AVIF, PNG, JPEG, GIF, and more. You can also convert between formats on the fly.",
      },
    },
    {
      "@type": "Question",
      name: "How fast is Morpics?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Morpics delivers images from edge locations globally using Cloudflare's network. Images are cached and served from the nearest location to your users for maximum speed.",
      },
    },
  ],
};
