/*
 * 手元の端末で動くプログラムなので、紙の上に動く見本は置かない。
 * 代わりに、同梱の記録の再生（npm run demo:diff）のレポートの写しを 3 枚並べ、再生であることを文と写しの下の一行で言う。
 * 写しは ops の 30days/products/rag-eval-harness/assets/ から 1280px に縮めて public/shots/rag-eval-harness/ に置いた。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。組み方は ../kit-sheet.tsx
 */
import Image from "next/image";

import type { Lang } from "@/i18n/routes";

import g from "../../guides/guides.module.css";
import { KitSheet, kitMetadata } from "../kit-sheet";
import { DemoNote } from "../shell";
import { copy } from "./copy";

const SHOTS = ["report-cards", "report-table", "report-detail"].map((name) => `/shots/rag-eval-harness/${name}.png`);

const SCREENS_IN_JAPANESE = {
  en: "The report screens below are in Japanese.",
  fr: "Les écrans du rapport ci-dessous sont en japonais.",
};

export const metadataFor = (lang: Lang) => kitMetadata(lang, "rag-eval-harness", copy[lang]);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <KitSheet lang={lang} slug="rag-eval-harness" latin="RAG Eval Harness" linkKey="rag-eval-harness" copy={t}>
      <section className={g.section}>
        <h2 className={g.heading}>{t.demoHeading}</h2>
        {lang !== "ja" && <DemoNote lang={lang} text={SCREENS_IN_JAPANESE[lang]} />}
        {t.demo.map((p) => (
          <p key={p} className={g.text}>
            {p}
          </p>
        ))}
        {SHOTS.map((src, i) => (
          <figure key={src} className={g.figure}>
            <Image src={src} alt={t.figures[i].alt} width={1280} height={800} />
            <figcaption className={g.caption}>{t.figures[i].caption}</figcaption>
          </figure>
        ))}
      </section>
    </KitSheet>
  );
}
