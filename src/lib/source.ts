import { loader } from "fumadocs-core/source";
import { defineDocs } from "fumadocs-mdx/macro";
import { z } from "zod";

export const docsPageSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  full: z.boolean().optional(),
});

const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: docsPageSchema,
  },
});

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

export function getPageImageUrl(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "image.webp"];

  return {
    segments,
    url: `${"/"}${[page.locale, "og", "docs", ...segments].filter(Boolean).join("/")}`,
  };
}
