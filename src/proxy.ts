import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const acceptHeader = request.headers.get("accept") || "";
  const wantsMarkdown =
    acceptHeader.includes("text/markdown") || acceptHeader.includes("text/x-markdown");

  // Handle direct .md requests (e.g. /docs.md, /docs/ai-orb.md)
  if (pathname.endsWith(".md")) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/markdown";
    url.searchParams.set("path", pathname);
    return NextResponse.rewrite(url);
  }

  // Handle Content Negotiation via Accept: text/markdown on /docs routes
  if (wantsMarkdown && (pathname === "/docs" || pathname.startsWith("/docs/"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/markdown";
    url.searchParams.set("path", pathname);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/docs", "/docs/:path*", "/:path*.md"],
};
