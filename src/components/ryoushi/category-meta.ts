/*
 * 分類のページ（/kits・/sites・/works）の metadata。CategorySheet（料紙の CSS と書体を読む）から分けた ──
 * 日本語の /kits は新しい組み方なので、metadata のためだけに料紙の CSS を読ませない。
 */
import { localIndexPage } from "@/i18n/catalog";
import { pageMetadata } from "@/i18n/meta";
import type { Lang } from "@/i18n/routes";
import type { Category } from "@/lib/projects";

export function categoryMetadata(lang: Lang, category: Category) {
  const sheet = localIndexPage(lang, category);
  return pageMetadata(lang, `/${category}`, {
    title: sheet.title,
    description: sheet.lede,
    image: `/og/${category}.png`,
  });
}
