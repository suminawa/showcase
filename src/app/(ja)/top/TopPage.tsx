/*
 * THESIS: 三つの柱（業務自動化・AI活用・Web制作）の店を、スプレッドシートと同じマス目の上に開く。作品集の一列（料紙）と、
 *   SaaS の LP の定番（大きな見出し・機能の箱・料金の三列）の両方を断る。
 * OWN-WORLD: 紙 #F6F3EB の地に白いセル、境目は墨 12% のマス目。見出しは明朝 600、本文はゴシック。
 *   朱は選択の枠（2px と右下の四角）と落款だけ。届いた 1 通は墨の面。
 * STORY: 一字一マスの見出しで「業務自動化、AI活用、Web制作。」と名乗り、その下の 3 列で柱ごとに代表のキット・値段・
 *   棚への道・動く見本・受託の一行を見せる。期限アラートの見本は日付を進めると届く 1 通が変わる。迷えば /contact。
 * FIRST VIEWPORT: PC は、誰向けの一行 → 6×3 マスの見出しと二文 → 三つの柱の 3 列（柱の名・一行・代表のキットの頭）。
 *   スマホは 1 列で、見出しと二文のすぐ下に業務自動化の柱が入る。
 * FORM: 方眼（自前の候補の 7 番目「原稿用紙・方眼」を、スプレッドシートの文法と合わせた。seed a9babaf7）
 * LANG: 日本語・英語・仏語が同じ組み方（英仏は src/app/[lang]/page.tsx から lang を受ける）。
 *   英仏の見出しは一字一マスにできないので、同じ方眼の上に柱ごとの 1 行を置く。更新の記録は日本語だけ。
 */
import { Fragment } from "react";
import Link from "next/link";

import { ContactMail } from "@/components/track/ContactMail";
import { KitCard, KitGrid } from "@/components/site/KitCard";
import { PriceLadder } from "@/components/site/PriceLadder";
import u from "@/components/site/ui.module.css";
import { localContact, localGuides, localPillar, localProject } from "@/i18n/catalog";
import { hrefFor, type Lang } from "@/i18n/routes";
import { PURCHASE_NOTE, UI, money } from "@/i18n/ui";
import { guideHref, guides } from "@/lib/guides";
import { KIT_FACTS, type FlagshipSlug } from "@/lib/kit-facts";
import { priceNow } from "@/lib/prices";
import {
  KIT_SET,
  PILLARS,
  categoryCount,
  featuredProjects,
  kitSetListTotal,
  pillarKits,
  projectHref,
  projects,
  type Project,
} from "@/lib/projects";
import { UPDATES, updateDate } from "@/lib/updates";

import { copy } from "../copy";
import { HeroSheet } from "./HeroSheet";
import s from "./top.module.css";

function listPrice(lang: Lang, project: Project): string {
  const sale = project.sale;
  if (sale?.status === "free") return UI[lang].free;
  if (sale?.status !== "onsale" || sale.price == null) return "";
  return money(lang, priceNow(project.slug, sale.price).price);
}

const bySlug = new Map(projects.map((p) => [p.slug, p]));
const titleOf = (slug: string) => bySlug.get(slug)?.title ?? slug;

export function TopPage({ lang = "ja" }: { lang?: Lang }) {
  const t = copy[lang];
  const ja = lang === "ja";
  const start = featuredProjects();
  const kitCount = categoryCount("kits").total;
  const latest = UPDATES.slice(0, 4);
  const newestGuides = (ja ? guides.map((g) => ({ ...g, localTitle: g.title })) : localGuides(lang)).slice(-3).reverse();
  const href = (path: string) => hrefFor(lang, path);
  // 3 本セットの名。日本語は決まった字、英仏は 3 本の題を並べる
  const setLabel = ja
    ? KIT_SET.label
    : KIT_SET.slugs.map((slug) => localProject(lang, bySlug.get(slug)!).title).join(lang === "fr" ? ", " : ", ");

  return (
    <main id="main" className={s.page}>
      {/* ---- 第一画面: 名乗りと三つの柱 ------------------------------------ */}
      <section className={s.hero} aria-labelledby="hero-title">
        <div className={u.wrap}>
          <p className={s.kicker}>{t.kicker}</p>
          <div className={s.heroHead}>
            {ja ? (
              /* 一字一マス（6 列 × 3 段、柱ごとに 1 段）。字を span に割らず、字間で送りをマスの幅にそろえる（DESIGN.md の The Masu Rule）。
                 英字は原稿用紙と同じ扱いで、2 字は 1 マス（AI）、3 字は 2 マス（Web）に置く */
              <h1 id="hero-title" className={s.masu}>
                業務自動化、
                <br />
                <span className={s.latin}>AI</span>活用、
                <br />
                <span className={`${s.latin} ${s.latin2}`}>Web</span>制作。
              </h1>
            ) : (
              /* 英仏: 同じ方眼の上に、柱ごとの 1 行（3 段）。欧文は一字一マスにならないので、行の送りだけをマスにそろえる */
              <h1 id="hero-title" className={`${s.masu} ${s.masuLatin}`}>
                {t.taglineLines.map((line, i) => (
                  <Fragment key={line}>
                    {i > 0 && <br />}
                    {line}
                  </Fragment>
                ))}
              </h1>
            )}
            <div className={s.heroText}>
              <p className={s.lede}>{t.pitchText}</p>
              <p className={s.ctas}>
                <Link href={href("/kits")} className={u.btn}>
                  {t.seeKits(kitCount)}
                </Link>
                <Link href={href("/contact")} className={u.linkLine}>
                  {t.pricing}
                </Link>
              </p>
            </div>
          </div>

          {/* 三つの柱。PC は 3 列、スマホは 1 列。柱ごとに 名・一行・代表のキット（値段つき）・棚への道・動く見本・受託の一行 */}
          <div className={s.pillars}>
            {PILLARS.map((source) => {
              const pillar = localPillar(lang, source);
              const picks = pillar.picks.map((pick) => ({ ...pick, project: localProject(lang, bySlug.get(pick.slug)!) }));
              return (
                <section key={pillar.id} className={s.pillar} aria-labelledby={`pillar-${pillar.id}`}>
                  <div className={s.pillarHead}>
                    <h2 id={`pillar-${pillar.id}`} className={s.pillarName}>
                      {pillar.name}
                    </h2>
                    <p className={s.pillarLede}>{pillar.lede}</p>
                  </div>
                  <p className={s.picksHead}>
                    {t.picksHead}
                    <span className={s.picksTax}>{t.picksTax}</span>
                  </p>
                  <ol className={s.pickList}>
                    {picks.map((pick, i) => (
                      <li key={pick.slug} className={u.select}>
                        <Link href={href(projectHref(pick.project))} className={s.pick}>
                          <span className={s.pickNo} aria-hidden="true">
                            {i + 1}
                          </span>
                          <span className={s.pickBody}>
                            <span className={s.pickName}>{pick.project.title}</span>
                            <span className={s.pickHook}>{pick.hook}</span>
                          </span>
                          <span className={s.pickPrice}>{listPrice(lang, pick.project)}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                  {/* 柱の下の三行（帳票の体）: 一覧 → 棚、動く見本 → 見本、受託 → 頼み方と料金。行ごと押せる */}
                  <ul className={s.pillarLinks}>
                    <li>
                      <Link href={href(`/kits#${pillar.id}`)} className={s.pillarLink}>
                        <span className={s.pillarLinkLabel}>{t.linkAll}</span>
                        <span className={s.pillarLinkText}>{t.linkAllText(pillarKits(pillar).length)}</span>
                      </Link>
                    </li>
                    <li>
                      <Link href={href(pillar.demo.href)} className={s.pillarLink}>
                        <span className={s.pillarLinkLabel}>{t.linkDemo}</span>
                        <span className={s.pillarLinkText}>{pillar.demo.label}</span>
                      </Link>
                    </li>
                    <li>
                      <Link href={href("/contact#ladder")} className={s.pillarLink}>
                        <span className={s.pillarLinkLabel}>{t.linkService}</span>
                        <span className={s.pillarLinkText}>
                          {pillar.service.label}
                          <span className={s.pillarPrice}>
                            {pillar.service.price}
                            {t.taxExcluded}
                          </span>
                        </span>
                      </Link>
                    </li>
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- 動く見本（業務自動化: 期限アラート。ほかの柱の見本への道も） ---- */}
      <section id="demo" className={s.demoSec} aria-labelledby="demo-title">
        <div className={`${u.wrap} ${s.demoGrid}`}>
          <div className={u.sectionHead}>
            <h2 id="demo-title" className={u.h2}>
              {t.demoHead}
            </h2>
            <p className={u.lede}>{t.demoLede}</p>
            <ul className={s.demoList}>
              {PILLARS.filter((p) => p.id !== "automation").map((source) => {
                const pillar = localPillar(lang, source);
                return (
                <li key={pillar.id}>
                  <Link href={href(pillar.demo.href)} className={s.demoLink}>
                    <span className={s.demoPillar}>{pillar.short}</span>
                    {pillar.demo.label}
                  </Link>
                </li>
                );
              })}
            </ul>
          </div>
          <div className={s.demoBox}>
            <HeroSheet />
          </div>
        </div>
      </section>

      {/* ---- 買う前に確かめられること ------------------------------------- */}
      <section className={s.facts} aria-labelledby="facts-title">
        <div className={u.wrap}>
          <h2 id="facts-title" className={s.factsTitle}>
            {t.factsHead}
          </h2>
          <ul className={s.factGrid}>
            {t.facts.map((fact) => (
              <li key={fact.label} className={s.fact}>
                <span className={s.factFig}>{fact.fig}</span>
                <span className={s.factLabel}>{fact.label}</span>
                <span className={s.factText}>{fact.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- 看板 3 本の中身（業務自動化の柱の先頭） ------------------------ */}
      <section className={u.section} aria-labelledby="three-title">
        <div className={u.wrap}>
          <div className={u.sectionHead}>
            <h2 id="three-title" className={u.h2}>
              {t.threeHead}
            </h2>
            <p className={u.lede}>{t.threeLede}</p>
            {!ja && <p className={u.small}>{PURCHASE_NOTE[lang]}</p>}
          </div>
          <KitGrid count={start.length} large label={t.threeHead}>
            {start.map((project) => (
              <KitCard key={project.slug} project={project} lang={lang} large facts={KIT_FACTS[project.slug as FlagshipSlug][lang]} />
            ))}
          </KitGrid>
          <p className={s.setLine}>{t.setLine(setLabel, money(lang, KIT_SET.price), money(lang, kitSetListTotal()))}</p>
          <p className={s.more}>
            <Link href={href("/kits")} className={u.linkLine}>
              {t.moreKits(kitCount)}
            </Link>
          </p>
        </div>
      </section>

      {/* ---- 頼み方と料金 ------------------------------------------------- */}
      <section className={`${u.section} ${s.ladder}`} aria-labelledby="ladder-title">
        <div className={`${u.wrap} ${s.ladderGrid}`}>
          <div className={u.sectionHead}>
            <h2 id="ladder-title" className={u.h2}>
              {t.ladderHead}
            </h2>
            <p className={u.lede}>{t.ladderLede}</p>
            <p className={s.ladderCta}>
              <Link href={href("/contact")} className={u.btn}>
                {t.ladderCta}
              </Link>
            </p>
            <p className={u.small}>
              {t.mailBefore}
              <ContactMail className={u.link} />
              {t.mailAfter}
            </p>
          </div>
          <div className={s.tableWrap}>
            {ja ? (
              <PriceLadder />
            ) : (
              /* 英仏は頼めることと目安の帳票（/contact と同じ出どころ）。階段の表は日本語だけ */
              <dl className={`${u.spec} ${s.services}`}>
                {localContact(lang).services.map((row) => (
                  <Fragment key={row.title}>
                    <dt>{row.title}</dt>
                    <dd>{row.price}</dd>
                  </Fragment>
                ))}
              </dl>
            )}
          </div>
        </div>
      </section>

      {/* ---- 更新の記録（日本語だけ。文は CHANGELOG の日本語） --------------- */}
      {ja && (
      <section className={u.section} aria-labelledby="updates-title">
        <div className={u.wrap}>
          <div className={u.sectionHead}>
            <h2 id="updates-title" className={u.h2}>
              更新の記録
            </h2>
            <p className={u.lede}>キットは出したあとも直しています。直した内容は、版ごとに記録しています。</p>
          </div>
          <ol className={s.updates}>
            {latest.map((up) => (
              <li key={`${up.slug}-${up.version}`} className={s.update}>
                <span className={s.updateDate}>{updateDate(up.date)}</span>
                <span className={s.updateKit}>
                  {titleOf(up.slug)} <span className={s.updateVer}>{up.version}</span>
                </span>
                <span className={s.updateNote}>{up.note}</span>
              </li>
            ))}
          </ol>
          <p className={s.more}>
            <Link href="/kits#updates" className={u.linkLine}>
              すべての更新を見る
            </Link>
          </p>
        </div>
      </section>
      )}

      {/* ---- 作っている人・悩みから読む ------------------------------------- */}
      <section className={`${u.section} ${s.closing}`} aria-labelledby="maker-title">
        <div className={`${u.wrap} ${s.closingGrid}`}>
          <div className={s.maker}>
            <h2 id="maker-title" className={u.h2}>
              {t.makerHead}
            </h2>
            <p className={u.lede}>{t.maker1}</p>
            <p className={u.lede}>{t.maker2}</p>
            <p>
              <Link href="/about" className={u.linkLine} hrefLang={ja ? undefined : "ja"}>
                {t.aboutLink}
              </Link>
            </p>
          </div>
          {/* 悩みから読む（日本語だけの紙）。英仏は訳した題で、日本語の紙へ渡す */}
          <div className={s.reads}>
            <h2 className={u.h2}>{t.readsHead}</h2>
            <ul className={s.readList}>
              {newestGuides.map((g) => (
                <li key={g.slug}>
                  <Link href={guideHref(g)} className={s.read} hrefLang={ja ? undefined : "ja"}>
                    {g.localTitle}
                  </Link>
                </li>
              ))}
            </ul>
            <p>
              <Link href="/guides" className={u.linkLine} hrefLang={ja ? undefined : "ja"}>
                {t.readsAll}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
