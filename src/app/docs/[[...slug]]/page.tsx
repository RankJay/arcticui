import { PageActions } from "@/components/docs/page-actions";
import { getMDXComponents } from "@/components/mdx";
import { getPageMarkdownBySlug } from "@/lib/docs-markdown";
import { getPageImageUrl, source } from "@/lib/source";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const SITE_URL = "https://ui.rankjay.com";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const pageUrl = new URL(page.url, SITE_URL).toString();
  const markdownUrl = `${pageUrl}.md`;
  const markdownContent = getPageMarkdownBySlug(params.slug) || "";
  const image = getPageImageUrl(page);
  const imageUrl = new URL(image.url, SITE_URL).toString();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.data.title,
    description: page.data.description,
    url: pageUrl,
    image: imageUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    author: {
      "@type": "Organization",
      name: "Rank UI",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Rank UI",
      url: SITE_URL,
    },
  };

  return (
    <>
      <script id="docs-jsonld" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
      <DocsPage toc={page.data.toc} full={page.data.full}>
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        <PageActions
          title={page.data.title}
          markdownUrl={markdownUrl}
          markdownContent={markdownContent}
        />
        <DocsBody>
          <MDX
            components={getMDXComponents({
              a: createRelativeLink(source, page),
            })}
          />
        </DocsBody>
      </DocsPage>
    </>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<"/docs/[[...slug]]">): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const image = getPageImageUrl(page);
  const pageUrl = new URL(page.url, SITE_URL).toString();
  const imageUrl = new URL(image.url, SITE_URL).toString();
  const markdownUrl = `${pageUrl}.md`;

  const pageTitle = `${page.data.title} - Rank UI`;

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: pageUrl,
      types: {
        "text/markdown": markdownUrl,
      },
    },
    other: {
      describedby: `${SITE_URL}/agent-readability.json`,
    },
    openGraph: {
      type: "article",
      url: pageUrl,
      title: pageTitle,
      description: page.data.description,
      siteName: "Rank UI",
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: page.data.description,
      images: [imageUrl],
    },
  };
}
