/*
 * LINE の中で動くので、紙の上に動く見本は置かない。中身・置き方・守り・費用を節で並べる。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。組み方は ../kit-sheet.tsx
 */
import type { Lang } from "@/i18n/routes";

import { KitSheet, kitMetadata } from "../kit-sheet";
import { copy } from "./copy";

export const metadataFor = (lang: Lang) => kitMetadata(lang, "line-concierge", copy[lang]);

export function Content({ lang }: { lang: Lang }) {
  return <KitSheet lang={lang} slug="line-concierge" latin="LINE Concierge" linkKey="line-concierge" copy={copy[lang]} />;
}
