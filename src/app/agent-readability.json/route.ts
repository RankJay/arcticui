export const revalidate = false;

const manifest = {
  version: "1.0",
  name: "Rank UI",
  description:
    "Copy-paste React components for modern product UI with shadcn CLI registry support.",
  baseUrl: "https://ui.rankjay.com",
  documentation: {
    llmsTxt: "https://ui.rankjay.com/llms.txt",
    llmsFullTxt: "https://ui.rankjay.com/llms-full.txt",
    format: "markdown",
    markdownExtension: ".md",
    contentNegotiation: {
      header: "Accept",
      value: "text/markdown",
    },
  },
  registry: {
    index: "https://ui.rankjay.com/r/registry.json",
    components: "https://ui.rankjay.com/r/{name}.json",
  },
  skills: {
    skillUrl: "https://ui.rankjay.com/skills/rank-ui/SKILL.md",
  },
};

export function GET() {
  return Response.json(manifest, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
