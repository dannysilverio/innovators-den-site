import { Helmet } from "react-helmet-async";
import { siteUrl, normalizeSiteMetadata } from "@workspace/api-zod/site-domain";

interface SeoProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  jsonLd?: object;
  publishedTime?: string;
  topic?: string;
}

const SITE_NAME = "The Innovators Den";
const DEFAULT_OG = siteUrl("/opengraph.jpg");

export default function Seo({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG,
  ogType = "website",
  jsonLd,
  publishedTime,
  topic,
}: SeoProps) {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = siteUrl(canonical || "/");

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@theinnovatorsden" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {ogType === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === "article" && topic && (
        <meta property="article:section" content={topic} />
      )}

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(normalizeSiteMetadata(jsonLd))}
        </script>
      )}
    </Helmet>
  );
}
