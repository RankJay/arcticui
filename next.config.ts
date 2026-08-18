import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const config: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@takumi-rs/core"],
  async headers() {
    return [
      {
        source: "/r/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS, HEAD" },
          { key: "Access-Control-Allow-Headers", value: "*" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Signal",
            value: "search=yes, ai-input=yes, ai-train=yes",
          },
        ],
      },
    ];
  },
};

const withMDX = createMDX();

export default withMDX(config);
