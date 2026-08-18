import "./globals.css";

import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://ui.rankjay.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Rank UI",
    template: "%s - Rank UI",
  },
  description: "Copy-paste React components for modern product UI.",
  alternates: {
    canonical: "/",
  },
  other: {
    describedby: `${SITE_URL}/agent-readability.json`,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Rank UI",
    description: "Copy-paste React components for modern product UI.",
    siteName: "Rank UI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rank UI",
    description: "Copy-paste React components for modern product UI.",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Rank UI",
  url: SITE_URL,
  description: "Copy-paste React components for modern product UI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <script id="website-jsonld" type="application/ld+json">
          {JSON.stringify(websiteJsonLd)}
        </script>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
