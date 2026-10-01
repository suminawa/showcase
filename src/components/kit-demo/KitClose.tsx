/*
 * GAS キットの見本ページの結びと、頭の値段の一行。
 * 中身・導入の時間・比べ方の文は src/lib/kit-demos.ts の一箇所から写す。
 * 値段は要求の時刻で決まる（kitDemo は既定で今の時刻）。置くページは dynamic = "force-dynamic"。
 * 売り場への道は /go/ の渡し口（goHref）を通す。
 */
import { localKitDemo } from "@/i18n/kit-demos";
import { localePath, type Lang } from "@/i18n/routes";
import { PURCHASE_NOTE, dateLabel } from "@/i18n/ui";
import { goHref } from "@/lib/go";
import { CHECKED_ON, type KitDemoSlug } from "@/lib/kit-demos";

import s from "./kit-demo.module.css";

/** 結びの言葉。中身・比べ方の文は src/lib/kit-demos.ts（日本語）と src/i18n/kit-demos.ts（英仏） */
const T = {
  ja: {
    note: "note で詳しく読む",
    booth: "BOOTH で購入する",
    title: (name: string) => `この見本は『${name}』の実物の仕組みです`,
    priceIs: (price: string) => `${price}です。`,
    box: "入っているもの",
    setup: "置くのにかかる時間",
    compare: "無料の道具で足りる方・このキットが合う方",
    freeEnough: "無料の道具で足りる方",
    fits: "このキットが合う方",
    checked: (date: string) => `ほかの道具の内容と値段は、${date} に各社のページで確かめたものです。`,
  },
  en: {
    note: "Read more on note",
    booth: "Buy on BOOTH",
    title: (name: string) => `This demo runs the actual ${name}`,
    priceIs: (price: string) => `${price}.`,
    box: "What’s included",
    setup: "Setup time",
    compare: "When free tools are enough, and when this kit fits",
    freeEnough: "Free tools may be enough",
    fits: "This kit is a good fit",
    checked: (date: string) => `Features and prices of the other tools were checked on each vendor’s site on ${date}.`,
  },
  fr: {
    note: "En savoir plus sur note",
    booth: "Acheter sur BOOTH",
    title: (name: string) => `Cette démo fait tourner le véritable ${name}`,
    priceIs: (price: string) => `${price}.`,
    box: "Contenu",
    setup: "Temps d’installation",
    compare: "Quand les outils gratuits suffisent, et quand ce kit convient",
    freeEnough: "Les outils gratuits peuvent suffire",
    fits: "Ce kit vous convient",
    checked: (date: string) => `Le contenu et les prix des autres outils ont été vérifiés sur le site de chaque éditeur le ${date}.`,
  },
} satisfies Record<Lang, unknown>;

function BuyLinks({ slug, lang }: { slug: KitDemoSlug; lang: Lang }) {
  const demo = localKitDemo(lang, slug);
  const from = localePath(lang, `/projects/${slug}`);
  return (
    <span className={s.buy}>
      <a href={goHref(demo.linkKey, "note", from)} rel="nofollow" className={s.link}>
        {T[lang].note}
      </a>
      <span aria-hidden="true">／</span>
      <a href={goHref(demo.linkKey, "booth", from)} rel="nofollow" className={s.link}>
        {T[lang].booth}
      </a>
    </span>
  );
}

/** 頭の下に置く一行。値段と買う道だけ */
export function KitPriceLine({ slug, lang = "ja" }: { slug: KitDemoSlug; lang?: Lang }) {
  const demo = localKitDemo(lang, slug);
  return (
    <p className={s.priceLine}>
      <span>
        <span className={s.nowrap}>{demo.price}</span>
        {demo.priceNote && <span className={s.priceNote}>{demo.priceNote}</span>}
      </span>
      <BuyLinks slug={slug} lang={lang} />
    </p>
  );
}

/** 値段の段落の下に添える、設定や修理を頼める出品への案内。リンクにするのは出品の名（日本語のまま）だけ */
export type KitService = { before: string; name: string; href: string; after: string };

/** 結び。これが実物の仕組みであること・値段・中身・導入の時間・比べ方・買う道 */
export function KitClose({
  slug,
  made,
  service,
  free,
  lang = "ja",
}: {
  slug: KitDemoSlug;
  made: string;
  service?: KitService;
  /** 無料版への案内（あるキットだけ）。行き先は /go/ の道 */
  free?: KitService;
  lang?: Lang;
}) {
  const demo = localKitDemo(lang, slug);
  const t = T[lang];
  // 比べる相手の名と一言のあいだ。日本語は全角の空き、英仏はダッシュ
  const gap = lang === "ja" ? "　" : " — ";
  const year = CHECKED_ON.slice(0, 4);
  const checkedOn =
    lang === "ja"
      ? CHECKED_ON.replace(/-/g, "/")
      : `${dateLabel(lang, CHECKED_ON)}${lang === "en" ? "," : ""} ${year}`;
  return (
    <section className={s.close} aria-labelledby="kit-close-title">
      <h2 id="kit-close-title" className={s.closeTitle}>
        {t.title(demo.name)}
      </h2>
      <p className={s.body}>{made}</p>
      <p className={s.body}>
        {t.priceIs(demo.price)}
        {lang !== "ja" && demo.priceNote ? " " : ""}
        {demo.priceNote} <BuyLinks slug={slug} lang={lang} />
      </p>
      {lang !== "ja" && <p className={s.body}>{PURCHASE_NOTE[lang]}</p>}
      {service && (
        <p className={s.body}>
          {service.before}
          <a href={service.href} className={s.link} target="_blank" rel="noopener" lang="ja">
            {service.name}
          </a>
          {service.after}
        </p>
      )}
      {free && (
        <p className={s.body}>
          {free.before}
          <a href={free.href} className={s.link} rel="noopener" lang="ja">
            {free.name}
          </a>
          {free.after}
        </p>
      )}

      <div className={s.closeGrid}>
        <div>
          <h3 className={s.head}>{t.box}</h3>
          <ul className={s.list}>
            {demo.box.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className={s.head}>{t.setup}</h3>
          <p className={s.body}>{demo.setup}</p>
        </div>
      </div>

      <div className={s.compare}>
        <h3 className={s.head}>{t.compare}</h3>
        <div className={s.closeGrid}>
          <div>
            <p className={s.compareHead}>{t.freeEnough}</p>
            <ul className={s.list}>
              {demo.freeEnough.map(({ who, alt }) => (
                <li key={who}>
                  <span className={s.who}>{who}</span>
                  <a href={alt.href} className={s.link} rel="noopener noreferrer">
                    {alt.name}
                  </a>
                  {gap}
                  {alt.note}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={s.compareHead}>{t.fits}</p>
            <ul className={s.list}>
              {demo.fits.map((fit) => (
                <li key={fit.who}>
                  <span className={s.who}>{fit.who}</span>
                  {fit.alts?.map((alt) => (
                    <span key={alt.href} className={s.source}>
                      <a href={alt.href} className={s.link} rel="noopener noreferrer">
                        {alt.name}
                      </a>
                      {gap}
                      {alt.note}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className={s.small}>{t.checked(checkedOn)}</p>
      </div>

      <p className={s.body}>
        {t.priceIs(demo.price)} <BuyLinks slug={slug} lang={lang} />
      </p>
    </section>
  );
}
