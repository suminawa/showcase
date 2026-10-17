/*
 * キットの一覧（/kits、日本語）。棚は三つの柱 ── 業務自動化（看板 3 本を先頭に）・AI活用・Web制作・Webアプリ制作。
 * 頭の案内とフッターの #automation・#ai・#web はここの棚へ飛ぶ。
 * PC は 3 列のカード、スマホは写真を左に置いた行。最後に更新の記録の全部と、設置の相談。
 * 英仏の /kits は前の組み方（CategorySheet。棚の分け方は同じ三つ）。
 */
import Link from "next/link";

import { KitCard, KitGrid } from "@/components/site/KitCard";
import u from "@/components/site/ui.module.css";
import { goHref } from "@/lib/go";
import { KIT_FACTS, isFlagship } from "@/lib/kit-facts";
import { yen } from "@/lib/prices";
import { INDEX_PAGES, KIT_SET, PILLARS, kitSetListTotal, pillarKits, projects, type PillarId } from "@/lib/projects";
import { UPDATES, updateDate } from "@/lib/updates";

import k from "./kits.module.css";

const titleOf = (slug: string) => projects.find((p) => p.slug === slug)?.title ?? slug;

/** 棚の一行に添える二文目（柱の一行は PILLARS が持つ） */
const SHELF_NOTE: Record<PillarId, string> = {
  automation: "どれも Google スプレッドシートで動き、手順書どおりに 15〜20 分ほどで置けます。月額の費用はかかりません。",
  ai: "AI を使うキットは、ご自身の API キーの利用料がかかります。月額のサービス料はかかりません。",
  web: "サイトやサービスを作る方に向けた、テンプレートと部品です。使っている技術を添えています。",
};

export function KitsPage() {
  const page = INDEX_PAGES.kits;
  const shelves = PILLARS.map((pillar) => ({ pillar, kits: pillarKits(pillar) }));

  return (
    <main id="main" className={k.page}>
      <header className={`${u.wrap} ${k.head}`}>
        <h1 className={k.title}>{page.title}</h1>
        <p className={u.lede}>{page.lede}</p>
        <nav className={k.toc} aria-label="棚の目次">
          <ol className={k.tocList}>
            {shelves.map(({ pillar, kits }) => (
              <li key={pillar.id}>
                <a href={`#${pillar.id}`} className={k.tocItem}>
                  {/* 目次は短い名（頭の案内と同じ字）。棚の題は柱の名の全部 */}
                  {pillar.short}
                  <span className={k.tocCount}>{kits.length} 本</span>
                </a>
              </li>
            ))}
            <li>
              <a href="#updates" className={k.tocItem}>
                更新の記録
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
                <p className={u.lede}>{SHELF_NOTE[pillar.id]}</p>
              </div>
              {flagships.length > 0 && (
                <KitGrid count={flagships.length} large label="はじめての方におすすめの 3 本">
                  {flagships.map((project, j) => (
                    <KitCard key={project.slug} project={project} large facts={isFlagship(project.slug) ? KIT_FACTS[project.slug].ja : undefined} eager={j === 0} />
                  ))}
                </KitGrid>
              )}
              {rest.length > 0 && (
                <div className={flagships.length > 0 ? k.restGrid : undefined}>
                  <KitGrid count={rest.length} label={pillar.name}>
                    {rest.map((project) => (
                      <KitCard key={project.slug} project={project} showTags={pillar.id === "web"} />
                    ))}
                  </KitGrid>
                </div>
              )}
              {pillar.id === "automation" && (
                <div className={k.notes}>
                  <p className={k.note}>
                    <span className={k.noteHead}>無料版</span>
                    <span>
                      期限アラートには、3 日前と当日の期限だけを毎朝 Slack にお知らせする無料版「期限アラート ライト」があります。
                      <a href={goHref("deadline-lite", "booth", "/kits")} rel="nofollow" className={u.link}>
                        BOOTH で受け取る
                      </a>
                    </span>
                  </p>
                  <p className={k.note}>
                    <span className={k.noteHead}>{KIT_SET.name}</span>
                    <span>
                      {KIT_SET.label}の 3 本は、まとめて {yen(KIT_SET.price)}（税込。単品の合計 {yen(kitSetListTotal())}）でもお求めいただけます。セットは、BOOTH の各キットのページで選べます。
                    </span>
                  </p>
                </div>
              )}
            </div>
          </section>
        );
      })}

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

      <section className={k.cta} aria-labelledby="kits-cta-title">
        <div className={`${u.wrap} ${k.ctaInner}`}>
          <div>
            <h2 id="kits-cta-title" className={u.h2}>
              設置や制作まで任せたい方へ
            </h2>
            <p className={u.lede}>
              キットの設置は 30,000 円から、AI の組み込みは 40,000 円から、LP・サイトの制作は 150,000 円から（いずれも税別）お受けします。1 か所の修正は 5,000 円からです。
            </p>
          </div>
          <Link href="/contact" className={u.btn}>
            頼み方と料金を見る
          </Link>
        </div>
      </section>
    </main>
  );
}
