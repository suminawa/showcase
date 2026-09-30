/*
 * 訳のある紙の metadata。canonical はその言語の道、hreflang は三言語と x-default（日本語の道）。
 * x-default を日本語の道にするのは、そこが最初の言語を振り分ける入口だから。
 */
import type { Metadata } from "next";

import { LANGS, localePath, type Lang } from "./routes";

const OG_LOCALE: Record<Lang, string> = { ja: "ja_JP", en: "en_US", fr: "fr_FR" };

/**
 * 自分の画を持たない紙に渡す、根の OGP の画（src/app/opengraph-image.png）。
 * openGraph を子で書くと親の画は引き継がれないことがあるので、明示して渡す。
 */
export const ROOT_OG_IMAGE = "/opengraph-image.png";

export function languageAlternates(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const lang of LANGS) out[lang] = localePath(lang, path);
  out["x-default"] = path;
  return out;
}

export function pageMetadata(
  lang: Lang,
  path: string,
  {
    title,
    description,
    image,
    absoluteTitle = false,
  }: { title: string; description: string; image?: string; absoluteTitle?: boolean },
): Metadata {
  const url = localePath(lang, path);
  const images = [image ?? ROOT_OG_IMAGE];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      siteName: "Showcase",
      title,
      description,
      url,
      locale: OG_LOCALE[lang],
      images,
    },
    // 根の twitter（日本語の説明）を引き継がせない。各言語の字で必ず書く
    twitter: { card: "summary_large_image", title, description, images },
  };
}
