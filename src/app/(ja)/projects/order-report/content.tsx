/*
 * THESIS: 受注 CSV を貼ると月次の数字が埋まる画面を、先に見せる（Operate）。売り物のキットのページの型（kit-parts.tsx。手本は /projects/deadline）。
 *   頭: 題は検索語（定期通販・受注 CSV）と差（新規・解約・来月の定期売上まで）、品物の名は題の下。右に購入の箱（KitOffer）、スマホは下の帯（KitBuyBar）。
 *   1 画面目: Excel の中で動くテンプレートなので、動く見本の代わりに結果の画面の写し（左に貼った CSV・右に埋まった集計）。
 *   そのあと: 出る数字 → 証拠 → 誰向け → 比較 → 値段（差し込み込み・領収書）→ 手順（KitSales）→ 試す・頼む。
 * TRUTH: 数字は packages/order-report-template の README.ja.md と BUILD-REPORT.md（1.0.0）から。Excel 2019 と Google スプレッドシートでは確かめていない。
 * FORM: 方眼（DESIGN.md）。節の字は kit-parts.module.css。
 */
import Image from "next/image";

import { ContactMail } from "@/components/track/ContactMail";
import u from "@/components/site/ui.module.css";
import { localePath, type Lang } from "@/i18n/routes";
import { goHref } from "@/lib/go";

import { KitBuyBar, KitOffer, KitSales } from "../kit-parts";
import p from "../kit-parts.module.css";
import { DemoNote, ProjectShell, PurchaseNote, ShopEmbed, ShopLinks, projectMetadata } from "../shell";
import { copy } from "./copy";
import o from "./order-report.module.css";

const SLUG = "order-report";

/** BOOTH・note の鍵（links.json） */
const LINK = "order-report";

/** 結果の画面の写し（左に貼った受注 CSV・右に埋まった集計シート） */
const SHOT = { src: "/projects/order-report/screen-split.png", width: 2560, height: 1600 };

/** 無料版の名。日本語のまま出す（BOOTH のページが日本語のため） */
const FREE_NAME = "定期通販 受注集計テンプレート 無料版";

/** ココナラの差し込みの出品（テンプレート込み）。名は公開中の題と同じ字にする（出品のページが日本語のため日本語のまま出す） */
const COCONALA = { name: "定期通販の受注CSVを月次集計の表に差し込みます", href: "https://coconala.com/services/4463588" };

const SCREENS_IN_JAPANESE = {
  en: "The template’s sheets and the screen below are in Japanese.",
  fr: "Les feuilles du modèle et l’écran ci-dessous sont en japonais.",
};

export const metadataFor = (lang: Lang) => projectMetadata(lang, SLUG, copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const n = t.numbers;
  const c = t.close;
  return (
    <ProjectShell
      lang={lang}
      slug={SLUG}
      title={t.title}
      name={t.name}
      latin="Subscription Order Report"
      lede={t.lede}
      aside={<KitOffer lang={lang} slug={SLUG} linkKey={LINK} />}
      bar={<KitBuyBar lang={lang} slug={SLUG} linkKey={LINK} />}
    >
      {lang !== "ja" && <DemoNote lang={lang} text={SCREENS_IN_JAPANESE[lang]} />}
      <figure className={o.shot}>
        <a href={SHOT.src} target="_blank" rel="noopener">
          <Image
            src={SHOT.src}
            alt={t.shot.alt}
            width={SHOT.width}
            height={SHOT.height}
            sizes="(min-width: 1024px) 960px, 100vw"
            loading="eager"
            fetchPriority="high"
          />
        </a>
        <figcaption className={p.small}>{t.shot.caption}</figcaption>
      </figure>

      <section className={p.section} aria-labelledby="numbers-heading">
        <h2 id="numbers-heading" className={p.h2}>
          {n.heading}
        </h2>
        <p className={p.body}>{n.text}</p>
        <ul className={p.list}>
          {n.list.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className={p.body}>{n.editions}</p>
      </section>

      <KitSales lang={lang} slug={SLUG} name={t.name} linkKey={LINK} copy={t.sales} />

      <section className={p.section} aria-labelledby="close-heading">
        <h2 id="close-heading" className={p.h2}>
          {c.heading}
        </h2>
        <p className={p.body}>
          {c.free.before}
          <a href={goHref("order-report-lite", "booth", localePath(lang, `/projects/${SLUG}`))} rel="nofollow" className={u.linkLine}>
            {FREE_NAME}
          </a>
          {c.free.after}
        </p>
        <p className={p.body}>{c.service}</p>
        <p className={p.body}>
          {c.coconala.before}
          <a href={COCONALA.href} rel="nofollow" className={u.linkLine}>
            {COCONALA.name}
          </a>
          {c.coconala.after}
        </p>
        <p className={p.body}>
          {c.consult.before}
          <ContactMail className={u.linkLine} />
          {c.consult.after}
        </p>
        <p className={p.body}>
          {t.name}
          <ShopLinks lang={lang} slug={SLUG} linkKey={LINK} />
        </p>
        <ShopEmbed linkKey={LINK} />
        <PurchaseNote lang={lang} className={p.body} />
      </section>
    </ProjectShell>
  );
}
