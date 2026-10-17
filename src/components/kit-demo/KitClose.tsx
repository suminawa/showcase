/*
 * キットの品物のページの部品（期限・フォーム・予約・問い合わせ整理・AI 窓口・業務アプリ・SaaS の 7 本）。
 *
 *   KitBuy       頭の右の購入の箱（値段・BOOTH・note・無料版・設置・3 本セット）。看板 3 本が使う
 *   KitFacts     頭の一行の下に置く帳票（月額・置く時間ほか）。看板 3 本が使う
 *   KitPriceLine 頭の下に置く購入の一行（ほかの 4 本）
 *   KitClose     結び（実物の仕組みであること・中身・置く時間・比べ方・更新の記録・頼む・note・購入の一行）
 *
 * 中身・導入の時間・比べ方の文は src/lib/kit-demos.ts（英仏は src/i18n/kit-demos.ts）の一箇所から写す。
 * 値段は要求の時刻で決まる（置くページは dynamic = "force-dynamic"）。売り場への道は /go/ を通す。
 * 押す先は三つ: 主は BOOTH（買う）、note は「読む」、設置の依頼は /contact。
 */
import Link from "next/link";

import u from "@/components/site/ui.module.css";
import { NoteEmbed } from "@/components/note/NoteEmbed";
import links from "@/data/links.json";
import { localProject, projectPriceNow } from "@/i18n/catalog";
import { localKitDemo } from "@/i18n/kit-demos";
import { hrefFor, localePath, type Lang } from "@/i18n/routes";
import { PURCHASE_NOTE, dateLabel, money } from "@/i18n/ui";
import { goHref } from "@/lib/go";
import { CHECKED_ON, type KitDemoSlug } from "@/lib/kit-demos";
import { FREE_EDITION, KIT_FACTS, isFlagship } from "@/lib/kit-facts";
import { shortDate } from "@/lib/prices";
import { KIT_SET, kitSetListTotal, projects } from "@/lib/projects";
import { updateDate, updatesFor } from "@/lib/updates";

import k from "./kit-close.module.css";

const T = {
  ja: {
    note: "note で中身を詳しく読む",
    booth: "BOOTH で購入する",
    install: "設置まで頼む（30,000 円〜・税別）",
    free: "無料版を受け取る（BOOTH）",
    tax: "税込・買い切り",
    intro: (until: string, list: string) => `${until} までの発売記念の値です（定価 ${list}）。`,
    buyLabel: "購入",
    set: (names: string, price: string, total: string) =>
      `${names}は、3 本セット（${price}・単品の合計 ${total}）でもお求めいただけます。BOOTH の同じページで選べます。`,
    title: (name: string) => `この見本は『${name}』の実物の仕組みです`,
    box: "入っているもの",
    setup: "使い始めるまでの時間",
    compare: "比べてから選ぶ",
    freeEnough: "無料の道具で足りる方",
    fits: "このキットが合う方",
    checkedAt: (date: string) => `（${date} に確認）`,
    checked: (date: string) => `ほかの道具の内容と値段は、${date} に各社のページで確かめたものです（日付を添えたものを除きます）。`,
    updates: "更新の記録",
    help: "設置や直しを頼む",
    read: "note で中身を詳しく読む",
    closeLine: (price: string) => `${price}（税込）の買い切りです。`,
  },
  en: {
    note: "Read the details on note",
    booth: "Buy on BOOTH",
    install: "Have it set up for you (from ¥30,000 + tax)",
    free: "Get the free version (BOOTH)",
    tax: "tax included, one-time purchase",
    intro: (until: string, list: string) => `Launch price until ${until} (regular price ${list}).`,
    buyLabel: "Purchase",
    set: (names: string, price: string, total: string) =>
      `${names} are also sold as a 3-kit bundle (${price}; ${total} separately), selectable on the same BOOTH page.`,
    title: (name: string) => `This demo runs the actual ${name}`,
    box: "What’s included",
    setup: "Setup time",
    compare: "Compare before you choose",
    freeEnough: "Free tools may be enough",
    fits: "This kit is a good fit",
    checkedAt: (date: string) => ` (checked ${date})`,
    checked: (date: string) => `Features and prices of the other tools were checked on each vendor’s site on ${date}, unless a date is given.`,
    updates: "Updates",
    help: "Get help with setup",
    read: "Read the details on note",
    closeLine: (price: string) => `${price}, tax included, one-time purchase.`,
  },
  fr: {
    note: "Lire le détail sur note",
    booth: "Acheter sur BOOTH",
    install: "Faire installer (dès 30 000 ¥ HT)",
    free: "Obtenir la version gratuite (BOOTH)",
    tax: "TTC, achat unique",
    intro: (until: string, list: string) => `Prix de lancement jusqu’au ${until} (prix normal ${list}).`,
    buyLabel: "Achat",
    set: (names: string, price: string, total: string) =>
      `${names} existent aussi en lot de 3 kits (${price} ; ${total} séparément), à choisir sur la même page BOOTH.`,
    title: (name: string) => `Cette démo fait tourner le véritable ${name}`,
    box: "Contenu",
    setup: "Temps d’installation",
    compare: "Comparer avant de choisir",
    freeEnough: "Les outils gratuits peuvent suffire",
    fits: "Ce kit vous convient",
    checkedAt: (date: string) => ` (vérifié le ${date})`,
    checked: (date: string) => `Le contenu et les prix des autres outils ont été vérifiés sur le site de chaque éditeur le ${date}, sauf date indiquée.`,
    updates: "Mises à jour",
    help: "Se faire aider pour l’installation",
    read: "Lire le détail sur note",
    closeLine: (price: string) => `${price} TTC, achat unique.`,
  },
} satisfies Record<Lang, unknown>;

/** 「2026-10-17」→ 日本語は 2026/10/17、英仏は Oct 17, 2026 / 17 oct. 2026 */
function checkedLabel(lang: Lang, iso: string): string {
  if (lang === "ja") return iso.replace(/-/g, "/");
  const year = iso.slice(0, 4);
  return `${dateLabel(lang, iso)}${lang === "en" ? "," : ""} ${year}`;
}

/** 値段の大きな字と、記念価格の期間中だけ添える一文 */
function priceOf(slug: KitDemoSlug, lang: Lang): { yen: string; note?: string } {
  const p = projectPriceNow(slug);
  const yen = money(lang, p.price);
  if (!p.intro) return { yen };
  return { yen, note: T[lang].intro(lang === "ja" ? shortDate(p.intro.until) : dateLabel(lang, p.intro.until), money(lang, p.intro.list)) };
}

/** 3 本セットの一文（セットに入る 3 本の紙だけ） */
function setLine(slug: string, lang: Lang): string | null {
  if (!(KIT_SET.slugs as readonly string[]).includes(slug)) return null;
  const names = KIT_SET.slugs
    .map((s) => {
      const project = projects.find((p) => p.slug === s);
      return project ? localProject(lang, project).title : s;
    })
    .join(lang === "ja" ? "・" : ", ");
  return T[lang].set(names, money(lang, KIT_SET.price), money(lang, kitSetListTotal()));
}

function boothHref(slug: KitDemoSlug, lang: Lang) {
  const demo = localKitDemo(lang, slug);
  return goHref(demo.linkKey, "booth", localePath(lang, `/projects/${slug}`));
}

function noteHref(slug: KitDemoSlug, lang: Lang) {
  const demo = localKitDemo(lang, slug);
  return goHref(demo.linkKey, "note", localePath(lang, `/projects/${slug}`));
}

/** 頭の右の購入の箱。値段 → BOOTH → note → 無料版・設置 → 3 本セット */
export function KitBuy({ slug, lang = "ja" }: { slug: KitDemoSlug; lang?: Lang }) {
  const t = T[lang];
  const price = priceOf(slug, lang);
  const freeKey = FREE_EDITION[slug];
  const set = setLine(slug, lang);
  return (
    <div className={k.buy}>
      <p className={k.price}>
        <span className={k.yen}>{price.yen}</span>
        <span className={k.tax}>{t.tax}</span>
      </p>
      {price.note && <p className={k.small}>{price.note}</p>}
      <div className={k.buttons}>
        <a href={boothHref(slug, lang)} rel="nofollow" className={u.btn}>
          {t.booth}
        </a>
        <a href={noteHref(slug, lang)} rel="nofollow" className={u.btnGhost}>
          {t.note}
        </a>
      </div>
      <ul className={k.more}>
        {freeKey && (
          <li>
            <a href={goHref(freeKey, "booth", localePath(lang, `/projects/${slug}`))} rel="nofollow" className={u.linkLine}>
              {t.free}
            </a>
          </li>
        )}
        <li>
          <Link href={hrefFor(lang, "/contact")} className={u.linkLine}>
            {t.install}
          </Link>
        </li>
      </ul>
      {set && <p className={k.small}>{set}</p>}
      {lang !== "ja" && <p className={k.small}>{PURCHASE_NOTE[lang]}</p>}
    </div>
  );
}

/** 帳票（月額・置く時間・知らせる先など）。看板 3 本の頭の、一行の下に置く */
export function KitFacts({ slug, lang = "ja" }: { slug: KitDemoSlug; lang?: Lang }) {
  if (!isFlagship(slug)) return null;
  return (
    <dl className={`${u.spec} ${k.facts}`}>
      {KIT_FACTS[slug][lang].map((f) => (
        <div key={f.label} className={k.fact}>
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** 頭の下に置く購入の一行（看板 3 本以外のキット）。値段・BOOTH・note・設置 */
export function KitPriceLine({ slug, lang = "ja" }: { slug: KitDemoSlug; lang?: Lang }) {
  const t = T[lang];
  const price = priceOf(slug, lang);
  const set = setLine(slug, lang);
  return (
    <div className={k.strip}>
      <p className={k.price}>
        <span className={k.yen}>{price.yen}</span>
        <span className={k.tax}>{t.tax}</span>
      </p>
      <div className={k.buttons}>
        <a href={boothHref(slug, lang)} rel="nofollow" className={u.btn}>
          {t.booth}
        </a>
        <a href={noteHref(slug, lang)} rel="nofollow" className={u.btnGhost}>
          {t.note}
        </a>
        <Link href={hrefFor(lang, "/contact")} className={u.linkLine}>
          {t.install}
        </Link>
      </div>
      {price.note && <p className={k.small}>{price.note}</p>}
      {set && <p className={k.small}>{set}</p>}
    </div>
  );
}

/** 値段の段落の下に添える、設定や修理を頼める出品への案内。リンクにするのは出品の名（日本語のまま）だけ */
export type KitService = {
  before: string;
  name: string;
  href: string;
  after: string;
};

function ServiceLine({ item, external = true }: { item: KitService; external?: boolean }) {
  return (
    <p className={k.body}>
      {item.before}
      <a href={item.href} className={u.link} target={external ? "_blank" : undefined} rel="noopener" lang="ja">
        {item.name}
      </a>
      {item.after}
    </p>
  );
}

/** 結び。これが実物の仕組みであること・中身・導入の時間・比べ方・更新の記録・頼む・note・購入の一行 */
export function KitClose({
  slug,
  made,
  setup,
  service,
  free,
  lang = "ja",
}: {
  slug: KitDemoSlug;
  /** 見本が何の実物かの一文（無いページは題だけ） */
  made?: string;
  /** 設定ごと頼める出品への案内（あるキットだけ） */
  setup?: KitService;
  service?: KitService;
  /** 無料版への案内（あるキットだけ）。行き先は /go/ の道 */
  free?: KitService;
  lang?: Lang;
}) {
  const demo = localKitDemo(lang, slug);
  const { note } = links[demo.linkKey] as { note?: string };
  const t = T[lang];
  // 比べる相手の名と一言のあいだ。日本語は全角の空き、英仏はダッシュ
  const gap = lang === "ja" ? "　" : " — ";
  const checked = checkedLabel(lang, demo.checkedOn ?? CHECKED_ON);
  const updates = lang === "ja" ? updatesFor(slug) : [];
  const price = priceOf(slug, lang);
  const helps = [setup, service].filter(Boolean) as KitService[];

  return (
    <section className={k.close} aria-labelledby="kit-close-title">
      <div className={k.closeHead}>
        <h2 id="kit-close-title" className={k.h2}>
          {t.title(demo.name)}
        </h2>
        {made && <p className={k.body}>{made}</p>}
      </div>

      <div className={k.pair}>
        <section className={k.block} aria-labelledby="kit-box">
          <h3 id="kit-box" className={k.h3}>
            {t.box}
          </h3>
          <ul className={k.list}>
            {demo.box.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
        <section className={k.block} aria-labelledby="kit-setup">
          <h3 id="kit-setup" className={k.h3}>
            {t.setup}
          </h3>
          <p className={k.body}>{demo.setup}</p>
        </section>
      </div>

      <section className={k.compare} aria-labelledby="kit-compare">
        <h3 id="kit-compare" className={k.h3}>
          {t.compare}
        </h3>
        <div className={k.compareGrid}>
          <div className={k.compareCol}>
            <p className={k.compareHead}>{t.freeEnough}</p>
            <ul className={k.cases}>
              {demo.freeEnough.map(({ who, alt }) => (
                <li key={who}>
                  <span className={k.who}>{who}</span>
                  <span className={k.alt}>
                    <a href={alt.href} className={u.link} rel="noopener noreferrer">
                      {alt.name}
                    </a>
                    {gap}
                    {alt.note}
                    {alt.checkedOn && <span className={k.when}>{t.checkedAt(checkedLabel(lang, alt.checkedOn))}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className={k.compareCol}>
            <p className={k.compareHead}>{t.fits}</p>
            <ul className={k.cases}>
              {demo.fits.map((fit) => (
                <li key={fit.who}>
                  <span className={k.who}>{fit.who}</span>
                  {fit.alts?.map((alt) => (
                    <span key={alt.href + alt.name} className={k.alt}>
                      <a href={alt.href} className={u.link} rel="noopener noreferrer">
                        {alt.name}
                      </a>
                      {gap}
                      {alt.note}
                      {alt.checkedOn && <span className={k.when}>{t.checkedAt(checkedLabel(lang, alt.checkedOn))}</span>}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className={k.small}>{t.checked(checked)}</p>
      </section>

      {updates.length > 0 && (
        <section className={k.block} aria-labelledby="kit-updates">
          <h3 id="kit-updates" className={k.h3}>
            {t.updates}
          </h3>
          <ol className={k.updates}>
            {updates.map((up) => (
              <li key={up.version} className={k.update}>
                <span className={k.updateHead}>
                  {updateDate(up.date)}　{up.version}
                </span>
                <span>{up.note}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {(helps.length > 0 || free) && (
        <section className={k.block} aria-labelledby="kit-help">
          <h3 id="kit-help" className={k.h3}>
            {t.help}
          </h3>
          {helps.map((item) => (
            <ServiceLine key={item.href} item={item} />
          ))}
          {free && <ServiceLine item={free} external={false} />}
        </section>
      )}

      {note && (
        <section className={k.block} aria-labelledby="kit-read">
          <h3 id="kit-read" className={k.h3}>
            {t.read}
          </h3>
          <NoteEmbed url={note} />
        </section>
      )}

      {lang !== "ja" && <p className={k.body}>{PURCHASE_NOTE[lang]}</p>}

      <div className={k.closeBuy}>
        <p className={k.closeLine}>{t.closeLine(price.yen)}</p>
        <div className={k.buttons}>
          <a href={boothHref(slug, lang)} rel="nofollow" className={u.btn}>
            {t.booth}
          </a>
          <a href={noteHref(slug, lang)} rel="nofollow" className={u.btnGhost}>
            {t.note}
          </a>
          <Link href={hrefFor(lang, "/contact")} className={u.linkLine}>
            {t.install}
          </Link>
        </div>
      </div>
    </section>
  );
}
