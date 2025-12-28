import { SITE_URL } from "@/components/elements/site-metadata";

export default function sitemap() {
  const lastModified = new Date();

  const publicRoutes = [
    { path: "", priority: 1 },
    { path: "/sign-in", priority: 0.8 },
    { path: "/pricing", priority: 0.9 },
    { path: "/playground", priority: 0.8 },
    { path: "/about-us", priority: 0.7 },
    { path: "/privacy-policy", priority: 0.5 },
    { path: "/terms-and-conditions", priority: 0.5 },
    { path: "/media-kit", priority: 0.7 },
  ];

  return publicRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: route.priority,
  }));
}
