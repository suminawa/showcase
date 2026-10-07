/*
 * 作品ページの共通の枠。どのページも同じ構え（入りの一筆・戻り・題と英字・一行・本文）なので、
 * 日本語のページと英仏のページ（[lang]）がここを通って同じ紙を描く。
 * 文そのものは各ページの copy.ts（{ ja, en, fr } の同じ形）にある。
 */
import Link from "next/link";

import { JsonLd } from "@/components/JsonLd";
import { LangSwitch } from "@/components/lang/LangSwitch";
import { pageMetadata } from "@/i18n/meta";
import { hrefFor, localePath, type Lang } from "@/i18n/routes";
import { PURCHASE_NOTE, UI } from "@/i18n/ui";
import links from "@/data/links.json";
import { goHref, type LinkKey } from "@/lib/go";
import { guideHref, guides } from "@/lib/guides";
import { NO_OG, projectJsonLd } from "@/lib/jsonld-project";

import { fontVars } from "./fonts";
import s from "./projects.module.css";

export type PageMeta = { title: string; description: string };

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
      {/* 関連する案内記事は作品の【あと】に（2026-10-07）。頭に置くと、動く実物が初画面の下へ押し出されていた */}
      {lang === "ja" && <RelatedGuides slug={slug} />}
    </main>
  );
}

/** 日本語の紙にだけ出す、この見本・この売り物を結びに置いている案内記事への一行（guides の kit か shop がこの slug） */
function RelatedGuides({ slug }: { slug: string }) {
  const related = guides.filter((g) => g.kit === slug || g.shop === slug);
  if (related.length === 0) return null;
  return (
    // 頭の格子の間隔（半行）に半行を足し、一行の字を罫の上へ戻す
    <p className={s.lede} style={{ marginTop: "var(--rp-pitch)" }}>
      関連する案内記事:{" "}
      {related.map((g, i) => (
        <span key={g.slug}>
          {i > 0 && "／"}
          <Link href={guideHref(g)} className={s.textLink}>
            {g.title}
          </Link>
        </span>
      ))}
    </p>
  );
}

function ProjectJsonLd({ lang, slug, title }: { lang: Lang; slug: string; title: string }) {
  const data = projectJsonLd(lang, slug, title);
  return data ? <JsonLd data={data} /> : null;
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
