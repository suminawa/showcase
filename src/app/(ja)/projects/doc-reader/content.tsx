/*
 * THESIS: 料紙の上に、窓を一つだけ開ける（Operate）。ここにある読み取りは見本ではなく実物で、
 *   同梱の書類 5 枚は鍵なしでも読み取れる。自分の書類は、鍵が置かれるまでは
 *   「いまは読み取れません」側に落ちる ── 見せかけの成功を作らない。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。窓の中は部品の文法（doc-reader.module.css の --dr-* だけ料紙に寄せる）。
 * COLOR: 朱は落款だけ。窓の中に選ぶ行為が無いので、朱は一切使わない。
 */
import type { Lang } from "@/i18n/routes";

import {
  AFTER_TOOL,
  ContactLine,
  DemoNote,
  ProjectShell,
  PurchaseNote,
  ShopEmbed,
  ShopLinks,
  projectMetadata,
} from "../shell";
import s from "../projects.module.css";
import { copy } from "./copy";
import { DocReaderDemo } from "./DocReaderDemo";

export const metadataFor = (lang: Lang) =>
  projectMetadata(lang, "doc-reader", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell
      lang={lang}
      slug="doc-reader"
      title={t.title}
      latin="Document Reader"
      lede={t.lede}
    >
      <DemoNote lang={lang} />
      <DocReaderDemo />

      <p className={s.lede} style={AFTER_TOOL}>
        {t.privacy}
      </p>
      <p className={s.lede}>
        {t.kit}
        <ShopLinks lang={lang} slug="doc-reader" linkKey="doc-reader" />
      </p>
      <ShopEmbed linkKey="doc-reader" />
      <PurchaseNote lang={lang} />
      <ContactLine lang={lang} />
    </ProjectShell>
  );
}
