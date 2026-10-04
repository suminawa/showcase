/*
 * 作品ページの共通の枠。どのページも同じ構え（入りの一筆・戻り・題と英字・一行・本文）なので、
 * 日本語のページと英仏のページ（[lang]）がここを通って同じ紙を描く。
 * 文そのものは各ページの copy.ts（{ ja, en, fr } の同じ形）にある。
 */
import Link from "next/link";

import { JsonLd } from "@/components/JsonLd";
import { LangSwitch } from "@/components/lang/LangSwitch";
import { localIndexPage, localProject } from "@/i18n/catalog";
import { pageMetadata } from "@/i18n/meta";
import { hrefFor, localePath, type Lang } from "@/i18n/routes";
import { PURCHASE_NOTE, UI } from "@/i18n/ui";
import links from "@/data/links.json";
import { goHref, type LinkKey } from "@/lib/go";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/jsonld";
import { priceNow } from "@/lib/prices";
import { projects } from "@/lib/projects";
import { SITE_NAME } from "@/lib/site";

import { fontVars } from "./fonts";
import s from "./projects.module.css";

export type PageMeta = { title: string; description: string };

/** OGP の画（/og/<slug>.png）を持たない作品ページ */
const NO_OG = new Set(["deadline", "form", "inbox-triage", "mcp-server"]);

/** 作品ページの metadata。OGP の画は /og/<slug>.png（持たないページは image なし） */
export function projectMetadata(lang: Lang, slug: string, meta: PageMeta, image = !NO_OG.has(slug)) {
  return pageMetadata(lang, `/projects/${slug}`, { ...meta, image: image ? `/og/${slug}.png` : undefined });
}

export function ProjectShell({
  lang,
  slug,
  title,
  latin,
  lede,
  head,
  children,
}: {
  lang: Lang;
  slug: string;
  title: string;
  latin: string;
  lede: React.ReactNode;
  /** 頭の一行の下に添えるもの（値札など） */
  head?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className={`${s.paper} ${fontVars}`}>
      <ProjectJsonLd lang={lang} slug={slug} title={title} />
      <LangSwitch lang={lang} path={`/projects/${slug}`} />
      {/* 入りの一筆。紙の右上を掠めて画面外へ抜ける。道具には一度も掛からない */}
      <div className={s.stroke} aria-hidden="true">
        <span className={`${s.ink} ${s.inkKasure}`} />
        <span className={`${s.ink} ${s.inkCore}`} />
      </div>

      <header className={s.head}>
        <Link href={hrefFor(lang, "/")} className={s.back}>
          <span className={s.seal} aria-hidden="true">
            墨
          </span>
          {UI[lang].back}
        </Link>
        <h1 className={s.title}>
          {title}
          {/* 英語の題が英字の添えと同じ字になる紙（Thirty Days）では、二度書かない */}
          {latin !== title && <span className={s.latin} aria-hidden="true">{latin}</span>}
        </h1>
        <p className={s.lede}>{lede}</p>
        {head}
      </header>

      <div className={s.work}>{children}</div>
    </main>
  );
}

/**
 * 作品ページの構造化データ。パンくず（トップ → 分類 → この紙）と、売り物なら Product と Offer。
 * 値段はいま払う税込の円（発売記念の期間中は記念の値。無料の見本は 0）。
 */
function ProjectJsonLd({ lang, slug, title }: { lang: Lang; slug: string; title: string }) {
  const source = projects.find((p) => p.slug === slug);
  if (!source) return null;
  const project = localProject(lang, source);
  const path = localePath(lang, `/projects/${slug}`);
  const data = [
    breadcrumbJsonLd([
      { name: SITE_NAME, path: localePath(lang, "/") },
      { name: localIndexPage(lang, project.category).title, path: localePath(lang, `/${project.category}`) },
      { name: title, path },
    ]),
  ];
  const sale = project.sale;
  if (sale && (sale.status === "free" || (sale.status === "onsale" && sale.price != null))) {
    data.push(
      productJsonLd({
        name: project.title,
        description: project.description,
        path,
        price: sale.status === "free" ? 0 : priceNow(slug, sale.price!).price,
        image: NO_OG.has(slug) ? undefined : `/og/${slug}.png`,
      }),
    );
  }
  return <JsonLd data={data} />;
}

/** 文の末尾に付ける売り場への道（「 ── note / BOOTH」）。links.json に URL の無い売り場は出さない */
export function ShopLinks({ lang, slug, linkKey }: { lang: Lang; slug: string; linkKey: LinkKey }) {
  const shop = links[linkKey] as { note?: string; booth?: string };
  const from = localePath(lang, `/projects/${slug}`);
  return (
    <>
      {shop.note && (
        <>
          {" ── "}
          <a href={goHref(linkKey, "note", from)} rel="nofollow" className={s.textLink}>
            note
          </a>
        </>
      )}
      {shop.booth && (
        <>
          {shop.note ? " / " : " ── "}
          <a href={goHref(linkKey, "booth", from)} rel="nofollow" className={s.textLink}>
            BOOTH
          </a>
        </>
      )}
    </>
  );
}

/** 英仏の紙にだけ出す、買い方の断り（日本語の売り場・円のまま） */
export function PurchaseNote({ lang, className = s.lede }: { lang: Lang; className?: string }) {
  if (lang === "ja") return null;
  return <p className={className}>{PURCHASE_NOTE[lang]}</p>;
}

const JAPANESE_DEMO = {
  en: "The demo below is in Japanese.",
  fr: "La démo ci-dessous est en japonais.",
};

/** 英仏の紙にだけ出す、道具の画面が日本語であることの断り（text で差し替えられる） */
export function DemoNote({ lang, text, style }: { lang: Lang; text?: string; style?: React.CSSProperties }) {
  if (lang === "ja") return null;
  return (
    <p className={s.lede} style={style}>
      {text ?? JAPANESE_DEMO[lang]}
    </p>
  );
}

/** 文中の `…` を等幅の字にする（設定の名前やコマンド） */
export function Rich({ text, codeClass }: { text: string; codeClass?: string }) {
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
  en: { before: "For requests and questions, write to ", after: ". Replies within 3 business days." },
  fr: { before: "Pour toute demande, écrivez à ", after: ". Réponse sous 3 jours ouvrés." },
};

export function ContactLine({ lang }: { lang: Lang }) {
  const t = CONTACT_LINE[lang];
  return (
    <p className={s.lede} id="contact">
      {t.before}
      <a href="mailto:hello@suminawa.dev" className={s.textLink}>
        hello@suminawa.dev
      </a>
      {t.after}
    </p>
  );
}
