import { getLLMsFullTxt } from "@/lib/docs-markdown";

export const revalidate = false;

export function GET() {
  const content = getLLMsFullTxt();
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
