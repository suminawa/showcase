import type { MetadataRoute } from "next";
import { sitemapEntries } from "@/lib/sitemap";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries();
}
