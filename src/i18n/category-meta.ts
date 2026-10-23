/* 分類のページ（/kits・/sites・/works）の metadata。日本語と英仏のページが同じものを読む */
import { localIndexPage } from "@/i18n/catalog";
import { pageMetadata } from "@/i18n/meta";
import type { Lang } from "@/i18n/routes";
import type { Category } from "@/lib/projects";

export function categoryMetadata(lang: Lang, category: Category) {
  const sheet = localIndexPage(lang, category);
  return pageMetadata(lang, `/${category}`, {
    title: sheet.title,
    description: sheet.description ?? sheet.lede,
    image: `/og/${category}.png`,
  });
}
