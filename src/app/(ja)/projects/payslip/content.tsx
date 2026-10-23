/*
 * THESIS: 社労士の一覧を貼ると、1 人ずつの明細 PDF が本人だけに届く。送り間違いを防ぐ段を先に見せる（Operate）。売り物のキットのページの型（kit-parts.tsx。手本は /projects/order-report）。
 *   頭: 題は検索語（給与明細・PDF・本人だけ）、品物の名は題の下。右に購入の箱（KitOffer。本体と社労士・制作会社用の 2 つ）、スマホは下の帯（KitBuyBar）。
 *   1 画面目: Google スプレッドシートの中で動くので、動く見本の代わりに取り込みの前後の画面の写し。
 *   そのあと: 毎月の流れ → 送り間違いを防ぐ 4 つの段 → 受け取る方の見え方（PDF・同意）→ 証拠 → 誰向け → 比較 → 値段 → 手順（KitSales）→ 試す・頼む。
 * TRUTH: 数字は packages/payslip-delivery-gas の README.ja.md・CHANGELOG.md（1.0.0）と npm test。文は ops の sales-page.md・booth-description.md。
 * 売り場の URL は links.json の payslip・payslip-lite（決まるまでは印。印のあいだ /go/ は 404、note の札は出さない）。
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
import o from "./payslip.module.css";

const SLUG = "payslip";

/** BOOTH・note の鍵（links.json） */
const LINK = "payslip";

/** 取り込みの前後（左に貼った社労士の一覧・右に 1 人 1 行の明細シート） */
const SHOT = { src: "/projects/payslip/paste.png", width: 2560, height: 1600 };

/** 明細 PDF・スマートフォンで開いたところ・知らせのメール */
const SHOT_PDF = { src: "/projects/payslip/pdf.png", width: 2560, height: 1600 };

/** 無料版の名。日本語のまま出す（BOOTH のページが日本語のため） */
const FREE_NAME = "給与明細 配布キット 無料版";

/** ココナラの設定の出品（キット込み）。名は公開中の題と同じ字にする（出品のページが日本語のため日本語のまま出す） */
const COCONALA = { name: "給与明細をPDFで本人だけに配る仕組みを設定します", href: "https://coconala.com/services/4465831" };

const SCREENS_IN_JAPANESE = {
  en: "The kit’s sheets, payslips and the screens below are in Japanese.",
  fr: "Les feuilles du kit, les bulletins et les écrans ci-dessous sont en japonais.",
};

export const metadataFor = (lang: Lang) => projectMetadata(lang, SLUG, copy[lang].meta);

function Shot({ shot, alt, caption, eager = false }: { shot: typeof SHOT; alt: string; caption: string; eager?: boolean }) {
  return (
    <figure className={o.shot}>
      <a href={shot.src} target="_blank" rel="noopener">
        <Image
          src={shot.src}
          alt={alt}
          width={shot.width}
          height={shot.height}
          sizes="(min-width: 1024px) 960px, 100vw"
          {...(eager ? { loading: "eager", fetchPriority: "high" } : {})}
        />
      </a>
      <figcaption className={p.small}>{caption}</figcaption>
    </figure>
  );
}

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const f = t.flow;
  const g = t.guard;
  const r = t.receive;
  const c = t.close;
  return (
    <ProjectShell
      lang={lang}
      slug={SLUG}
      title={t.title}
      name={t.name}
      latin="Payslip Delivery Kit"
      lede={t.lede}
      aside={<KitOffer lang={lang} slug={SLUG} linkKey={LINK} />}
      bar={<KitBuyBar lang={lang} slug={SLUG} linkKey={LINK} />}
    >
      {lang !== "ja" && <DemoNote lang={lang} text={SCREENS_IN_JAPANESE[lang]} />}
      <Shot shot={SHOT} alt={t.shot.alt} caption={t.shot.caption} eager />

      <section className={p.section} aria-labelledby="flow-heading">
        <h2 id="flow-heading" className={p.h2}>
          {f.heading}
        </h2>
        <p className={p.body}>{f.text}</p>
        <ol className={p.list}>
          {f.list.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
        <p className={p.body}>{f.import}</p>
      </section>

      <section className={p.section} aria-labelledby="guard-heading">
        <h2 id="guard-heading" className={p.h2}>
          {g.heading}
        </h2>
        <p className={p.body}>{g.text}</p>
        <ol className={p.list}>
          {g.list.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </section>

      <section className={p.section} aria-labelledby="receive-heading">
        <h2 id="receive-heading" className={p.h2}>
          {r.heading}
        </h2>
        <p className={p.body}>{r.text}</p>
        <Shot shot={SHOT_PDF} alt={t.shot2.alt} caption={t.shot2.caption} />
        <p className={p.body}>{r.consent}</p>
      </section>

      <KitSales lang={lang} slug={SLUG} name={t.name} linkKey={LINK} copy={t.sales} />

      <section className={p.section} aria-labelledby="close-heading">
        <h2 id="close-heading" className={p.h2}>
          {c.heading}
        </h2>
        <p className={p.body}>
          {c.free.before}
          <a href={goHref("payslip-lite", "booth", localePath(lang, `/projects/${SLUG}`))} rel="nofollow" className={u.linkLine}>
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
