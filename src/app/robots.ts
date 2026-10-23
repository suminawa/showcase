import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** 配布 zip の置き場（推測できない URL）と API、売り場への渡し口（/go/）は載せない */
const disallow = ["/dl/", "/api/", "/go/"];

/** AI の検索・回答・学習のクローラーも、ほかと同じく読んでよい（方針を明記するために名前を並べる） */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: AI_CRAWLERS, allow: "/", disallow },
    ],
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
