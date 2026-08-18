import { source } from "@/lib/source";
import type { MetadataRoute } from "next";

const SITE_URL = "https://ui.rankjay.com";

export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // HTML Documentation pages from Fumadocs source
  const docPages: MetadataRoute.Sitemap = source.getPages().map((page) => ({
    url: new URL(page.url, SITE_URL).toString(),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Direct Markdown (.md) endpoints for agents
  const markdownPages: MetadataRoute.Sitemap = source.getPages().map((page) => ({
    url: new URL(`${page.url}.md`, SITE_URL).toString(),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Static site and agent manifest routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/llms-full.txt`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/agent-readability.json`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/r/registry.json`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  return [...staticRoutes, ...docPages, ...markdownPages];
}
