import type { MetadataRoute } from "next";

const SITE_URL = "https://ui.rankjay.com";

export const revalidate = false;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-Web",
          "Anthropic-AI",
          "Google-Extended",
          "GoogleOther",
          "PerplexityBot",
          "Applebot-Extended",
          "cohere-ai",
          "OAI-SearchBot",
          "CCBot",
        ],
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
