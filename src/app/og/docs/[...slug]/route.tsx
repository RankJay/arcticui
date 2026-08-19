import { getPageImageUrl, source } from "@/lib/source";
import { generate as DefaultImage } from "fumadocs-ui/og/takumi";
import { notFound } from "next/navigation";
import { ImageResponse } from "takumi-js/response";

export const revalidate = false;

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageImageUrl(page).segments,
  }));
}

export async function GET(_req: Request, { params }: RouteContext<"/og/docs/[...slug]">) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  const image = getPageImageUrl(page);

  if (slug.at(-1) !== image.segments.at(-1)) {
    notFound();
  }

  return new ImageResponse(
    <DefaultImage
      title={page.data.title}
      description={page.data.description}
      site="Rank UI"
      primaryColor="rgba(255, 255, 255, 0.2)"
      primaryTextColor="rgb(255, 255, 255)"
    />,
    {
      width: 1200,
      height: 630,
      format: "webp",
    },
  );
}
