/*
 * THESIS: 毎週読んでいる自由記述が「今週の 3 つ」になるところを、先に読ませる（Operate）。売り物のキットの型（kit-parts.tsx。手本は /projects/deadline）。
 *   頭: 題は検索語（Google フォームの自由記述）と差（AI が分類して改善案 3 つに）、品物の名は題の下。右に購入の箱、スマホは下の帯。
 *   1 画面目: スプレッドシートの中で動くキットなので、動く見本の代わりに、同梱の見本の回答と再生される「今週の 3 つ」の写し（SurveyResult）。
 *   そのあと: できること・費用などの節 → 証拠 → 誰向け → 比較 → 値段（設置込み・領収書）→ つまずき（KitSheet が組む）
 * FORM: 方眼（DESIGN.md）。写しの中はスプレッドシートの文法（components/kit-demo/kit-demo.module.css）。
 */
import type { Lang } from "@/i18n/routes";

import { KitSheet, kitMetadata } from "../kit-sheet";
import { copy } from "./copy";
import { SurveyResult } from "./SurveyResult";

export const metadataFor = (lang: Lang) => kitMetadata(lang, "survey-analysis", copy[lang]);

export function Content({ lang }: { lang: Lang }) {
  return (
    <KitSheet lang={lang} slug="survey-analysis" latin="Customer Survey" linkKey="survey-analysis" copy={copy[lang]}>
      <SurveyResult lang={lang} />
    </KitSheet>
  );
}
