/*
 * THESIS: 見積もりという実務を、料紙の上の【帳面】として扱う（Operate）。
 *   表現がタスクを曇らせてはいけないので、料紙の法のうち「紙が八割」「動くのは一つ」は
 *   持ち込まない。引き継ぐのは、字が大と小の二段しか無いこと・箱を持たないこと・
 *   線は手の線であることの三つだけ。
 * OWN-WORLD: 枠も罫も背景色の切り替えも置かない。構造は縦の余白（すべて界線の
 *   間隔の整数倍）と、字の濃さだけが作る。数字だけが「大」の帯に立つ。
 * COLOR: 朱に役を一つ与えている ── 【朱は選ばれていることの印】。
 *   単価方式の選択とオプションのチェックにだけ点く。朱入れも捺印も、もともと
 *   「決めた」ことを示す色だった。墨は書かれたもの、朱は決めたもの。
 *   ＊ 朱を強調や注意に使い始めるとこの理屈は壊れる。選択以外に使わないこと。
 * STORY: 触れた数だけ朱が点り、右の合計が追いつく。
 * FIRST VIEWPORT: 頭（戻り・名乗り・一行）、左に記入、右に内訳と合計。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 */
import { QuoteSimulator } from "@/components/quote-simulator/QuoteSimulator";
import type { Lang } from "@/i18n/routes";

import {
  AFTER_TOOL,
  DemoNote,
  ProjectShell,
  PurchaseNote,
  ShopEmbed,
  ShopLinks,
  projectMetadata,
} from "../shell";
import s from "../projects.module.css";
import { copy } from "./copy";

export const metadataFor = (lang: Lang) =>
  projectMetadata(lang, "quote-simulator", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell
      lang={lang}
      slug="quote-simulator"
      title={t.title}
      latin="Quote"
      lede={t.lede}
    >
      <DemoNote lang={lang} />
      <QuoteSimulator />
      <p className={s.lede} style={AFTER_TOOL}>
        {t.kit}
        <ShopLinks lang={lang} slug="quote-simulator" linkKey="s1" />
      </p>
      <ShopEmbed linkKey="s1" />
      <PurchaseNote lang={lang} />
    </ProjectShell>
  );
}
