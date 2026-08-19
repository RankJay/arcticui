import { getPageMarkdownBySlug } from "@/lib/docs-markdown";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pathParam = searchParams.get("path");
  const slugParam = searchParams.get("slug");

  let slugs: string[] = [];

  if (slugParam) {
    slugs = slugParam.split("/").filter(Boolean);
  } else if (pathParam) {
    const cleanPath = pathParam.replace(/\.md$/, "").replace(/^\/docs\/?/, "");
    slugs = cleanPath ? cleanPath.split("/").filter(Boolean) : [];
  }

  const markdown = getPageMarkdownBySlug(slugs);

  if (!markdown) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
