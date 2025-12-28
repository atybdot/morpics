import { SITE_URL } from "@/components/elements/site-metadata";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/authenticated/", "/checkout/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
