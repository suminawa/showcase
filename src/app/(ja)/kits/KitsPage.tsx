/*
 * キットの一覧（/kits、日本語）。棚は三つの柱 ── 業務自動化（看板 3 本を先頭に）・AI活用・Web制作・Webアプリ制作。
 * 頭の案内とフッターの #automation・#ai・#web はここの棚へ飛ぶ。
 * PC は 3 列のカード、スマホは写真を左に置いた行。最後に更新の記録の全部と、設置の相談。
 * 英仏の /kits（src/app/[lang]/kits/page.tsx）も同じ組み方で、更新の記録のかわりに悩みから読む（日本語の紙）の訳した題を並べる。
 */
import Link from "next/link";

import { KitCard, KitGrid } from "@/components/site/KitCard";
import u from "@/components/site/ui.module.css";
import { CATALOG, localGuides, localIndexPage, localPillar } from "@/i18n/catalog";
import { hrefFor, type Lang } from "@/i18n/routes";
import { money } from "@/i18n/ui";
import { goHref } from "@/lib/go";
import { guideHref } from "@/lib/guides";
import { KIT_FACTS, isFlagship } from "@/lib/kit-facts";
import { KIT_SET, PILLARS, kitSetListTotal, pillarKits, projects, type PillarId } from "@/lib/projects";
import { UPDATES, updateDate } from "@/lib/updates";

import k from "./kits.module.css";

const titleOf = (slug: string) => projects.find((p) => p.slug === slug)?.title ?? slug;

/** 棚の一行に添える二文目（柱の一行は PILLARS が持つ）。英仏は catalog.ts の pillarCopy.note */
const SHELF_NOTE: Record<PillarId, string> = {
  automation: "Google スプレッドシートか Excel で動き、手順書どおりに 10〜20 分ほどで置けます。月額の費用はかかりません。",
  ai: "AI を使うキットは、ご自身の API キーの利用料がかかります。月額のサービス料はかかりません。",
  web: "サイトやサービスを作る方に向けた、テンプレートと部品です。使っている技術を添えています。",
};

const T: Record<
  Lang,
  {
    toc: string;
    tocGuides: string;
    count: (n: number) => string;
    three: string;
    setHead: string;
    freeHead: string;
    freeText: string;
    freeCta: string;
    setText: (label: string, price: string, total: string) => string;
    ctaHead: string;
    ctaLede: string;
    ctaButton: string;
  }
> = {
  ja: {
    toc: "棚の目次",
    tocGuides: "更新の記録",
    count: (n) => `${n} 本`,
    three: "はじめての方におすすめの 3 本",
    setHead: KIT_SET.name,
    freeHead: "無料版",
    freeText: "期限アラートには、3 日前と当日の期限だけを毎朝 Slack にお知らせする無料版「期限アラート ライト」があります。",
    freeCta: "BOOTH で受け取る",
    setText: (label, price, total) => `${label}の 4 本は、まとめて ${price}（税込。単品の合計 ${total}）でもお求めいただけます。セットは、BOOTH の各キットのページで選べます。`,
    ctaHead: "設置や制作まで任せたい方へ",
    ctaLede: "キットの設置は 30,000 円から、AI の組み込みは 40,000 円から、LP・サイトの制作は 150,000 円から（いずれも税別）お受けします。1 か所の修正は 5,000 円からです。",
    ctaButton: "頼み方と料金を見る",
  },
  en: {
    toc: "Shelves",
    tocGuides: "Guides (JA)",
    count: (n) => `${n} kits`,
    three: "Start here: three kits",
    setHead: "Set of four",
    freeHead: "Free version",
    freeText: "Deadline Alert has a free version, Deadline Alert Lite, which posts only the deadlines due in 3 days or today to Slack every morning.",
    freeCta: "Get it on BOOTH",
    setText: (label, price, total) => `${label} are also available as a set for ${price} (tax included; ${total} bought separately). Choose the set on each kit's BOOTH page.`,
    ctaHead: "Prefer to have it installed or built for you?",
    ctaLede: "Kit setup from ¥30,000, AI integration from ¥40,000, landing pages and websites from ¥150,000 (all excluding tax). Single fixes from ¥5,000.",
    ctaButton: "See pricing and how it works",
  },
  fr: {
    toc: "Rayons",
    tocGuides: "Guides (JA)",
    count: (n) => `${n} kits`,
    three: "Pour commencer : trois kits",
    setHead: "Lot de quatre",
    freeHead: "Version gratuite",
    freeText: "Alerte d’échéances existe en version gratuite, Alerte d’échéances Lite, qui envoie chaque matin sur Slack uniquement les échéances à J-3 et du jour.",
    freeCta: "Récupérer sur BOOTH",
    setText: (label, price, total) => `${label} sont aussi proposés en lot pour ${price} (TTC ; ${total} achetés séparément). Le lot se choisit sur la page BOOTH de chaque kit.`,
    ctaHead: "Vous préférez une installation ou une réalisation clés en main ?",
    ctaLede: "Installation d’un kit dès 30 000 ¥, intégration d’IA dès 40 000 ¥, landing pages et sites dès 150 000 ¥ (hors taxes). Petites corrections dès 5 000 ¥.",
    ctaButton: "Voir les tarifs et le déroulement",
  },
};

export function KitsPage({ lang = "ja" }: { lang?: Lang }) {
  const t = T[lang];
  const ja = lang === "ja";
  const page = localIndexPage(lang, "kits");
  const shelves = PILLARS.map((source) => ({ pillar: localPillar(lang, source), kits: pillarKits(source) }));
  const from = hrefFor(lang, "/kits");
  // 3 本セットの名。日本語は決まった字、英仏は 3 本の題を並べる
  const setLabel = ja ? KIT_SET.label : KIT_SET.slugs.map((slug) => CATALOG[lang].projects[slug]?.title ?? slug).join(", ");

  return (
    <main id="main" className={k.page}>
      <header className={`${u.wrap} ${k.head}`}>
        <h1 className={k.title}>{page.title}</h1>
        <p className={u.lede}>{page.lede}</p>
        <nav className={k.toc} aria-label={t.toc}>
          <ol className={k.tocList}>
            {shelves.map(({ pillar, kits }) => (
              <li key={pillar.id}>
                <a href={`#${pillar.id}`} className={k.tocItem}>
                  {/* 目次は短い名（頭の案内と同じ字）。棚の題は柱の名の全部 */}
                  {pillar.short}
                  <span className={k.tocCount}>{t.count(kits.length)}</span>
                </a>
              </li>
            ))}
            <li>
              <a href={ja ? "#updates" : "#guides"} className={k.tocItem}>
                {t.tocGuides}
              </a>
            </li>
          </ol>
        </nav>
      </header>

      {shelves.map(({ pillar, kits }, i) => {
        // 業務自動化の棚だけ、看板 3 本を帳票つきの大きなカードで先に出す
        const flagships = pillar.id === "automation" ? kits.filter((p) => isFlagship(p.slug)) : [];
        const rest = kits.filter((p) => !flagships.includes(p));
        return (
          <section
            key={pillar.id}
            id={pillar.id}
            className={`${u.section} ${k.shelf} ${i % 2 === 1 ? k.tinted : ""}`}
            aria-labelledby={`${pillar.id}-title`}
          >
            <div className={u.wrap}>
              <div className={u.sectionHead}>
                <h2 id={`${pillar.id}-title`} className={u.h2}>
                  {pillar.name}
                </h2>
                <p className={u.lede}>{pillar.lede}</p>
                <p className={u.lede}>{ja ? SHELF_NOTE[pillar.id] : CATALOG[lang].pillarCopy[pillar.id].note}</p>
              </div>
              {flagships.length > 0 && (
                <KitGrid count={flagships.length} large label={t.three}>
                  {flagships.map((project, j) => (
                    <KitCard
                      key={project.slug}
                      project={project}
                      lang={lang}
                      large
                      facts={isFlagship(project.slug) ? KIT_FACTS[project.slug][lang] : undefined}
                      eager={j === 0}
                    />
                  ))}
                </KitGrid>
              )}
              {rest.length > 0 && (
                <div className={flagships.length > 0 ? k.restGrid : undefined}>
                  <KitGrid count={rest.length} label={pillar.name}>
                    {rest.map((project) => (
                      <KitCard key={project.slug} project={project} lang={lang} showTags={pillar.id === "web"} />
                    ))}
                  </KitGrid>
                </div>
              )}
              {pillar.id === "automation" && (
                <div className={k.notes}>
                  <p className={k.note}>
                    <span className={k.noteHead}>{t.freeHead}</span>
                    <span>
                      {t.freeText}{" "}
                      <a href={goHref("deadline-lite", "booth", from)} rel="nofollow" className={u.link}>
                        {t.freeCta}
                      </a>
                    </span>
                  </p>
                  <p className={k.note}>
                    <span className={k.noteHead}>{t.setHead}</span>
                    <span>{t.setText(setLabel, money(lang, KIT_SET.price), money(lang, kitSetListTotal()))}</span>
                  </p>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* 更新の記録は日本語だけ（文は CHANGELOG の日本語）。英仏は、悩みから読む（日本語の紙）の訳した題を並べる */}
      {ja ? (
      <section id="updates" className={`${u.section} ${k.shelf} ${k.tinted}`} aria-labelledby="updates-title">
        <div className={u.wrap}>
          <div className={u.sectionHead}>
            <h2 id="updates-title" className={u.h2}>
              更新の記録
            </h2>
            <p className={u.lede}>キットは出したあとも直しています。公開した版ごとに、新しい順で並べています。</p>
          </div>
          <ol className={k.updates}>
            {UPDATES.map((up) => (
              <li key={`${up.slug}-${up.version}`} className={k.update}>
                <span className={k.updateDate}>{updateDate(up.date)}</span>
                <span className={k.updateKit}>
                  <Link href={`/projects/${up.slug}`} className={u.link}>
                    {titleOf(up.slug)}
                  </Link>{" "}
                  <span className={k.updateVer}>{up.version}</span>
                </span>
                <span className={k.updateNote}>{up.note}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      ) : (
      <section id="guides" className={`${u.section} ${k.shelf} ${k.tinted}`} aria-labelledby="guides-title">
        <div className={u.wrap}>
          <div className={u.sectionHead}>
            <h2 id="guides-title" className={u.h2}>
              {CATALOG[lang].guides.heading}
            </h2>
          </div>
          <ul className={k.guideList}>
            {[...localGuides(lang)].reverse().map((g) => (
              <li key={g.slug} className={k.guide}>
                <Link href={guideHref(g)} className={k.guideLink} hrefLang="ja">
                  <span className={k.guideTitle}>{g.localTitle}</span>
                  <span className={k.guideKit}>
                    {CATALOG[lang].guides.related}
                    {CATALOG[lang].projects[g.kit]?.title ?? g.kit}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      )}

      <section className={k.cta} aria-labelledby="kits-cta-title">
        <div className={`${u.wrap} ${k.ctaInner}`}>
          <div>
            <h2 id="kits-cta-title" className={u.h2}>
              {t.ctaHead}
            </h2>
            <p className={u.lede}>{t.ctaLede}</p>
          </div>
          <Link href={hrefFor(lang, "/contact")} className={u.btn}>
            {t.ctaButton}
          </Link>
        </div>
      </section>
    </main>
  );
}
