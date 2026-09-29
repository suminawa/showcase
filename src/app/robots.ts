import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** 配布 zip の置き場（推測できない URL）と API、売り場への渡し口（/go/）は載せない */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dl/", "/api/", "/go/"] },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
