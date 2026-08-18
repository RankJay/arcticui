import fs from "node:fs";
import path from "node:path";

import { source } from "@/lib/source";

const SITE_URL = "https://ui.rankjay.com";

const DOCS_DIR = path.join(process.cwd(), "content/docs");

const slugToFileMap: Record<string, string> = {
  "": path.join(DOCS_DIR, "index.mdx"),
  installation: path.join(DOCS_DIR, "installation.mdx"),
  changelog: path.join(DOCS_DIR, "changelog.mdx"),
  "ai-orb": path.join(DOCS_DIR, "(components)/ai-orb.mdx"),
  "liquid-glass": path.join(DOCS_DIR, "(components)/liquid-glass.mdx"),
  "radial-menu": path.join(DOCS_DIR, "(components)/radial-menu.mdx"),
};

function cleanMdxToMarkdown(content: string, title: string, description: string): string {
  // Strip frontmatter
  let text = content.replace(/^---[\s\S]*?---\n*/, "").trim();

  // Strip top-level JSX imports (only outside code fences)
  const lines = text.split("\n");
  let inCodeBlock = false;
  const processedLines: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      processedLines.push(line);
      continue;
    }

    if (!inCodeBlock && /^import\s+.*?;\s*$/.test(line.trim())) {
      continue;
    }

    processedLines.push(line);
  }

  text = processedLines.join("\n").trim();

  // Replace <ComponentPreview> ... </ComponentPreview>
  text = text.replace(/<ComponentPreview[^>]*>[\s\S]*?<\/ComponentPreview>/g, "").trim();

  // Replace <AutoTypeTable path="(.+?)" name="(.+?)" \/> with clean ref
  text = text.replace(
    /<AutoTypeTable\s+path="([^"]+)"\s+name="([^"]+)"\s*\/>/g,
    (_match, p1, p2) => {
      return `### TypeScript Type Definition\n- Interface: \`${p2}\`\n- Source File: \`${p1}\``;
    },
  );

  // Clean extra blank lines
  text = text.replace(/\n{3,}/g, "\n\n");

  return `# ${title}\n\n> ${description}\n\n${text}\n`;
}

export function getPageMarkdownBySlug(slugs: string[] = []): string | null {
  const key = slugs.join("/");
  const filePath = slugToFileMap[key];

  if (!filePath || !fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
    // Fallback: check source page
    const page = source.getPage(slugs);
    if (!page) return null;
    return `# ${page.data.title}\n\n> ${page.data.description}\n`;
  }

  const page = source.getPage(slugs);
  const rawContent = fs.readFileSync(/*turbopackIgnore: true*/ filePath, "utf-8");
  const title = page?.data.title || "Rank UI Documentation";
  const description = page?.data.description || "";

  return cleanMdxToMarkdown(rawContent, title, description);
}

export function getLLMsTxt(): string {
  const pages = source.getPages();

  const coreDocs = pages.filter((p) => !p.slugs.length || p.slugs[0] === "installation");
  const componentDocs = pages.filter((p) => p.slugs.length && p.slugs[0] !== "installation");

  const coreLinks = coreDocs
    .map((p) => `- [${p.data.title}](${SITE_URL}${p.url}.md): ${p.data.description}`)
    .join("\n");

  const componentLinks = componentDocs
    .map((p) => `- [${p.data.title}](${SITE_URL}${p.url}.md): ${p.data.description}`)
    .join("\n");

  return `# Rank UI

> Copy-paste React components for modern product UI. A shadcn registry providing sleek, physics-based, and shader-driven UI primitives.

## Core Documentation
${coreLinks}

## Components
${componentLinks}

## Full Documentation
- [Full Documentation](${SITE_URL}/llms-full.txt): Complete documentation bundle in a single text file.

## Registry Endpoints
- [Registry Index](${SITE_URL}/r/registry.json): List of all available registry components.
- [Radial Menu Component](${SITE_URL}/r/radial-menu.json): Shadcn registry JSON for Radial Menu.
- [AI Orb Component](${SITE_URL}/r/ai-orb.json): Shadcn registry JSON for AI Orb.
- [Liquid Glass Component](${SITE_URL}/r/liquid-glass.json): Shadcn registry JSON for Liquid Glass.
`;
}

export function getLLMsFullTxt(): string {
  const pages = source.getPages();

  const sections = pages.map((page) => {
    const md =
      getPageMarkdownBySlug(page.slugs) || `# ${page.data.title}\n\n${page.data.description}`;
    const pageUrl = `${SITE_URL}${page.url}`;
    const mdUrl = `${pageUrl}.md`;
    return `<!-- URL: ${pageUrl} | Markdown: ${mdUrl} -->\n${md}`;
  });

  return `# Rank UI — Full Documentation Bundle

> Copy-paste React components for modern product UI.
> Base URL: ${SITE_URL}
> Registry: ${SITE_URL}/r

---

${sections.join("\n\n---\n\n")}

---

# Registry Index Reference
\`\`\`json
https://ui.rankjay.com/r/registry.json
\`\`\`
`;
}
