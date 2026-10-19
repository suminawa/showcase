/*
 * THESIS: 「正答率 100% → 95%・悪くなった問い」を題のすぐ下に札で見せる（Operate）。売り物のキットのページの型（kit-parts.tsx。手本は /projects/deadline）。
 *   頭: 題は検索語（RAG・採点）と差（悪くなった問いを先頭に）、品物の名は題の下。右に購入の箱（KitOffer）、スマホは下の帯（KitBuyBar）。
 *   1 画面目: 頭のすぐ下に札（レポートの頭の写し。赤い枠はレポートと同じ色）と、レポートの実物（HTML）への道。
 *   そのあと: 見本の画面 3 枚 → 証拠 → 誰向け → 必要なもの → エンジニアでない方へ → 比較 → 中身の節 → 値段（設置込み・領収書）→ つまずき → 購入の決まり。
 * 手元の端末で動くプログラムなので、紙の上に動く見本は置かない。札と画面と HTML は、同梱の記録の再生（npm run demo:diff）のレポート。
 *   HTML は public/demos/rag-eval-harness/report.html（1.0.1 の demo:diff の出力そのまま。頭に noindex だけ足した）。
 *   画面の写しは ops の 30days/products/rag-eval-harness/assets/ から 1280px に縮めて public/shots/rag-eval-harness/ に置いた。
 * FORM: 方眼（DESIGN.md）。節の字は kit-parts.module.css。
 */
import Image from "next/image";

import type { Lang } from "@/i18n/routes";

import { KitAudience, KitBuyBar, KitCompare, KitOffer, KitPricing, KitProof, KitSteps } from "../kit-parts";
import p from "../kit-parts.module.css";
import type { KitSection } from "../kit-sheet";
import { DemoNote, ProjectShell, PurchaseNote, ShopEmbed, ShopLinks, projectMetadata } from "../shell";
import { copy } from "./copy";
import r from "./rag.module.css";

const SLUG = "rag-eval-harness";
const LINK = "rag-eval-harness";

const SHOTS = ["report-cards", "report-table", "report-detail"].map((name) => `/shots/rag-eval-harness/${name}.png`);

/** 同梱の記録の再生（npm run demo:diff）のレポートそのもの */
const REPORT = "/demos/rag-eval-harness/report.html";

const SCREENS_IN_JAPANESE = {
  en: "The report screens below are in Japanese.",
  fr: "Les écrans du rapport ci-dessous sont en japonais.",
};

export const metadataFor = (lang: Lang) => projectMetadata(lang, SLUG, copy[lang].meta);

function Section({ sec }: { sec: KitSection }) {
  return (
    <section className={p.section}>
      <h2 className={p.h2}>{sec.heading}</h2>
      {sec.text?.map((t) => (
        <p key={t} className={p.body}>
          {t}
        </p>
      ))}
      {sec.list && (
        <ul className={p.list}>
          {sec.list.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const s = t.sign;
  return (
    <ProjectShell
      lang={lang}
      slug={SLUG}
      title={t.title}
      name={t.name}
      latin="RAG Eval Harness"
      lede={t.lede}
      aside={<KitOffer lang={lang} slug={SLUG} linkKey={LINK} />}
      bar={<KitBuyBar lang={lang} slug={SLUG} linkKey={LINK} />}
    >
      {/* 札: レポートの頭の写し（正答率の落差と、悪くなった問いの赤い枠） */}
      <figure className={r.sign}>
        <div className={r.score}>
          <span className={r.label}>{s.label}</span>
          <span className={r.big}>{s.score}</span>
          <span className={r.delta}>▼ {s.delta}</span>
        </div>
        <div className={r.regressed}>
          <span className={r.label}>{s.regressedLabel}</span>
          <p className={r.question}>
            <span className={r.qid}>q05</span>
            {s.question}
          </p>
          <p className={r.verdict}>{s.verdict}</p>
        </div>
        <figcaption className={r.foot}>
          <a href={REPORT} className={r.open} target="_blank" rel="noopener">
            {s.open}
          </a>
          <span className={p.small}>{s.note}</span>
        </figcaption>
      </figure>

      <p className={`${p.body} ${r.intro}`}>{t.intro}</p>

      <section className={p.section} aria-labelledby="demo-heading">
        <h2 id="demo-heading" className={p.h2}>
          {t.demoHeading}
        </h2>
        {lang !== "ja" && <DemoNote lang={lang} text={SCREENS_IN_JAPANESE[lang]} />}
        {t.demo.map((text) => (
          <p key={text} className={p.body}>
            {text}
          </p>
        ))}
        {SHOTS.map((src, i) => (
          <figure key={src} className={r.shot}>
            {/* 押すと原寸の画像を開く（スマホでは縮んで字が読めないため） */}
            <a href={src} target="_blank" rel="noopener">
              <Image src={src} alt={t.figures[i].alt} width={1280} height={800} />
            </a>
            <figcaption className={p.small}>{t.figures[i].caption}</figcaption>
          </figure>
        ))}
      </section>

      <KitProof lang={lang} items={t.sales.proof} />
      <KitAudience lang={lang} copy={t.sales.audience} />
      <Section sec={t.needs} />

      <section className={p.section} aria-labelledby="roles-heading">
        <h2 id="roles-heading" className={p.h2}>
          {t.roles.heading}
        </h2>
        <p className={p.body}>{t.roles.intro}</p>
        <table className={p.table}>
          <thead>
            <tr>
              {t.roles.cols.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.roles.rows.map(([who, what], i) => (
              <tr key={i}>
                <th scope="row" data-label={t.roles.cols[0]}>
                  {who}
                </th>
                <td data-label={t.roles.cols[1]}>{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={p.pair}>
          <div className={p.cell}>
            <h3 className={p.h3}>{t.roles.checkHeading}</h3>
            <ul className={p.list}>
              {t.roles.check.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className={p.cell}>
            <h3 className={p.h3}>{t.roles.requestHeading}</h3>
            <blockquote className={r.request}>{t.roles.request}</blockquote>
          </div>
        </div>
      </section>

      <KitCompare lang={lang} slug={SLUG} name={t.name} copy={t.sales.compare} />
      {t.sections.map((sec) => (
        <Section key={sec.heading} sec={sec} />
      ))}
      <KitPricing lang={lang} slug={SLUG} linkKey={LINK} />
      <KitSteps lang={lang} groups={t.sales.steps} />

      <section className={p.section} aria-labelledby="buy-heading">
        <h2 id="buy-heading" className={p.h2}>
          {t.buyHeading}
        </h2>
        <p className={p.body}>
          {t.buy}
          <ShopLinks lang={lang} slug={SLUG} linkKey={LINK} />
        </p>
        <ShopEmbed linkKey={LINK} />
        <PurchaseNote lang={lang} className={p.body} />
      </section>
    </ProjectShell>
  );
}
