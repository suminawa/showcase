/*
 * スプレッドシートの中で動くので、紙の上に動く見本は置かない。できること・初期設定・費用・できないことを節で並べる。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。組み方は ../kit-sheet.tsx
 */
import type { Lang } from "@/i18n/routes";

import { KitSheet, kitMetadata } from "../kit-sheet";
import { copy } from "./copy";

export const metadataFor = (lang: Lang) => kitMetadata(lang, "survey-analysis", copy[lang]);

export function Content({ lang }: { lang: Lang }) {
  return <KitSheet lang={lang} slug="survey-analysis" latin="Customer Survey" linkKey="survey-analysis" copy={copy[lang]} />;
}
