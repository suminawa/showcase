/*
 * 作品ページの共通の枠（方眼。DESIGN.md）。日本語のページと英仏のページ（[lang]）がここを通る。
 *   現在地（分類 › 題）→ 頭（題・一行・頭の下に添えるもの。右に購入の箱を置けるページもある）→ 本文 → 返品の決まり・関連記事
 * 本文の中身は前の版のクラス（projects.module.css の lede・textLink、見本の CSS）を読むので、
 * その変数（--rp-*）は .compat が方眼の色と字で用意する。
 * 文そのものは各ページの copy.ts（{ ja, en, fr } の同じ形）にある。
 */
import Link from "next/link";
import { ViewTransition } from "react";

import { JsonLd } from "@/components/JsonLd";
import u from "@/components/site/ui.module.css";
import { ContactMail } from "@/components/track/ContactMail";
import { localIndexPage } from "@/i18n/catalog";
import { pageMetadata } from "@/i18n/meta";
import { hrefFor, localePath, type Lang } from "@/i18n/routes";
import { PURCHASE_NOTE, RETURN_NOTE } from "@/i18n/ui";
import links from "@/data/links.json";
import { goHref, type LinkKey } from "@/lib/go";
import { NoteEmbed } from "@/components/note/NoteEmbed";
import { guideHref, guides } from "@/lib/guides";
import { NO_OG, projectJsonLd } from "@/lib/jsonld-project";
import { projects } from "@/lib/projects";

import sh from "./shell.module.css";
import s from "./projects.module.css";

export type PageMeta = { title: string; description: string };

/** 作品ページの metadata。OGP の画は /og/<slug>.png（持たないページは image なし） */
export function projectMetadata(
  lang: Lang,
  slug: string,
  meta: PageMeta,
  image = !NO_OG.has(slug),
) {
  return pageMetadata(lang, `/projects/${slug}`, {
    ...meta,
    image: image ? `/og/${slug}.png` : undefined,
  });
}

const CRUMBS: Record<Lang, string> = { ja: "現在地", en: "Breadcrumb", fr: "Fil d’Ariane" };
const BUY: Record<Lang, string> = { ja: "購入", en: "Purchase", fr: "Achat" };

export function ProjectShell({
  lang,
  slug,
  title,
  name,
  lede,
  head,
  aside,
  bar,
  children,
}: {
  lang: Lang;
  slug: string;
  title: string;
  /**
   * 品物の名（「期限アラート GAS キット」）。題を検索語にしたページだけが持つ（kit-parts.tsx）。
   * あれば題の下に小さく添え、現在地・構造化データ・一覧のカードから伸びる名にはこちらを使う
   */
  name?: string;
  /** 題に添える英字（前の版の名残。いまの頭には出さない） */
  latin: string;
  lede: React.ReactNode;
  /** 頭の一行の下に添えるもの（値札など） */
  head?: React.ReactNode;
  /** 頭の右に置く箱（購入の箱）。あるページだけ、PC で頭を左右に割る */
  aside?: React.ReactNode;
  /**
   * スマホ（1024px 未満）で画面の下に留める購入の帯（kit-parts.tsx の KitBuyBar）。
   * 渡すと、スマホでは頭の右の箱を出さない（結果の画面を題のすぐ下に出すため。値段と押す先は帯が持つ）
   */
  bar?: React.ReactNode;
  children: React.ReactNode;
}) {
  const label = name ?? title;
  const project = projects.find((p) => p.slug === slug);
  const shelf = project ? localIndexPage(lang, project.category) : null;
  return (
    <ViewTransition default="paper">
      <main id="main" className={`${sh.page} ${sh.compat}`}>
        <ProjectJsonLd lang={lang} slug={slug} title={label} />
        <div className={u.wrap}>
          {project && shelf && (
            <nav className={sh.crumbs} aria-label={CRUMBS[lang]}>
              <ol>
                <li>
                  <Link href={hrefFor(lang, `/${project.category}`)} className={sh.crumbLink}>
                    {shelf.title}
                  </Link>
                </li>
                <li aria-current="page">{label}</li>
              </ol>
            </nav>
          )}

          {/* 割れる頭は、スマホでは 題 → 購入の箱 → 添えるもの、PC では左に題と添えるもの・右に購入の箱 */}
          <header className={`${sh.head} ${aside ? sh.headSplit : ""}`}>
            <div className={sh.headMain}>
              {/* 一覧のカードの品名（KitCard）と同じ名。押したカードの名がこの題へ伸びる */}
              {name ? (
                <>
                  <h1 className={sh.title}>{title}</h1>
                  <ViewTransition name={`t-${slug}`} share="morph" default="none">
                    <p className={sh.name}>{name}</p>
                  </ViewTransition>
                </>
              ) : (
                <ViewTransition name={`t-${slug}`} share="morph" default="none">
                  <h1 className={sh.title}>{title}</h1>
                </ViewTransition>
              )}
              <p className={sh.lede}>{lede}</p>
            </div>
            {aside && (
              <aside className={`${sh.aside} ${bar ? sh.asideWide : ""}`} aria-label={BUY[lang]}>
                {aside}
              </aside>
            )}
            {head && <div className={sh.headExtra}>{head}</div>}
          </header>

          <div className={sh.work}>{children}</div>
          <ReturnNote lang={lang} slug={slug} />
          {/* 関連する案内記事は作品の【あと】に。頭に置くと、動く実物が初画面の下へ押し出される */}
          {lang === "ja" && <RelatedGuides slug={slug} />}
          {bar}
        </div>
      </main>
    </ViewTransition>
  );
}

/** 有料の売り物の紙にだけ出す、返品と返金の決まり（構造化データの hasMerchantReturnPolicy と同じ中身） */
function ReturnNote({ lang, slug }: { lang: Lang; slug: string }) {
  const sale = projects.find((p) => p.slug === slug)?.sale;
  if (sale?.status !== "onsale" || sale.price == null) return null;
  return <p className={sh.note}>{RETURN_NOTE[lang]}</p>;
}

/** 日本語の紙にだけ出す、この見本・この売り物を結びに置いている案内記事への一行（guides の kit か shop がこの slug） */
function RelatedGuides({ slug }: { slug: string }) {
  const related = guides.filter((g) => g.kit === slug || g.shop === slug);
  if (related.length === 0) return null;
  return (
    <section className={sh.related} aria-labelledby="related-guides">
      <h2 id="related-guides" className={sh.relatedHead}>
        関連する案内記事
      </h2>
      <ul className={sh.relatedList}>
        {related.map((g) => (
          <li key={g.slug}>
            <Link href={guideHref(g)} className={sh.relatedLink}>
              {g.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProjectJsonLd({
  lang,
  slug,
  title,
}: {
  lang: Lang;
  slug: string;
  title: string;
}) {
  const data = projectJsonLd(lang, slug, title);
  return data ? <JsonLd data={data} /> : null;
}

/** 文の末尾に付ける売り場への道（「 ── note / BOOTH」）。links.json に URL の無い売り場は出さない */
export function ShopLinks({
  lang,
  slug,
  linkKey,
}: {
  lang: Lang;
  slug: string;
  linkKey: LinkKey;
}) {
  const shop = links[linkKey] as { note?: string; booth?: string };
  const from = localePath(lang, `/projects/${slug}`);
  return (
    <>
      {shop.note && (
        <>
          {" ── "}
          <a
            href={goHref(linkKey, "note", from)}
            rel="nofollow"
            className={s.textLink}
          >
            note
          </a>
        </>
      )}
      {shop.booth && (
        <>
          {shop.note ? " / " : " ── "}
          <a
            href={goHref(linkKey, "booth", from)}
            rel="nofollow"
            className={s.textLink}
          >
            BOOTH
          </a>
        </>
      )}
    </>
  );
}

/** 売り物の note の記事のカード（URL は links.json。note が無い売り物は何も出さない） */
export function ShopEmbed({ linkKey }: { linkKey: LinkKey }) {
  const { note } = links[linkKey] as { note?: string };
  return note ? <NoteEmbed url={note} /> : null;
}

/** 英仏の紙にだけ出す、買い方の断り（日本語の売り場・円のまま） */
export function PurchaseNote({
  lang,
  className = s.lede,
}: {
  lang: Lang;
  className?: string;
}) {
  if (lang === "ja") return null;
  return <p className={className}>{PURCHASE_NOTE[lang]}</p>;
}

const JAPANESE_DEMO = {
  en: "The demo below is in Japanese.",
  fr: "La démo ci-dessous est en japonais.",
};

/** 英仏の紙にだけ出す、道具の画面が日本語であることの断り（text で差し替えられる） */
export function DemoNote({
  lang,
  text,
  style,
}: {
  lang: Lang;
  text?: string;
  style?: React.CSSProperties;
}) {
  if (lang === "ja") return null;
  return (
    <p className={s.lede} style={style}>
      {text ?? JAPANESE_DEMO[lang]}
    </p>
  );
}

/** 文中の `…` を等幅の字にする（設定の名前やコマンド） */
export function Rich({
  text,
  codeClass,
}: {
  text: string;
  codeClass?: string;
}) {
  return (
    <>
      {text.split("`").map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className={codeClass}>
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** 本文の最初の段落に付ける上の空き（道具のすぐ下の一行） */
export const AFTER_TOOL = { marginTop: "calc(2 * var(--rp-pitch))" } as const;

/** ご依頼の一行（「ご依頼・ご相談は hello@suminawa.dev へ。3 営業日以内に返信します。」） */
export const CONTACT_LINE: Record<Lang, { before: string; after: string }> = {
  ja: { before: "ご依頼・ご相談は ", after: " へ。3 営業日以内に返信します。" },
  en: {
    before: "For requests and questions, write to ",
    after: ". Replies within 3 business days.",
  },
  fr: {
    before: "Pour toute demande, écrivez à ",
    after: ". Réponse sous 3 jours ouvrés.",
  },
};

export function ContactLine({ lang }: { lang: Lang }) {
  const t = CONTACT_LINE[lang];
  return (
    <p className={s.lede} id="contact">
      {t.before}
      <ContactMail className={s.textLink} />
      {t.after}
    </p>
  );
}
