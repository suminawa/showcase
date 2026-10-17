/*
 * キットの一覧（/kits、日本語）。棚は三つ ── 看板 3 本・事務の道具・制作者と開発者向け。
 * PC は 3 列のカード、スマホは写真を左に置いた行。最後に更新の記録の全部と、設置の相談。
 * 英仏の /kits は前の組み方（CategorySheet）のまま。
 */
import Link from "next/link";

import { KitCard, KitGrid } from "@/components/site/KitCard";
import u from "@/components/site/ui.module.css";
import { goHref } from "@/lib/go";
import { KIT_FACTS, type FlagshipSlug } from "@/lib/kit-facts";
import { yen } from "@/lib/prices";
import { INDEX_PAGES, KIT_SET, kitSetListTotal, kitShelves, projects } from "@/lib/projects";
import { UPDATES, updateDate } from "@/lib/updates";

import k from "./kits.module.css";

const titleOf = (slug: string) => projects.find((p) => p.slug === slug)?.title ?? slug;

export function KitsPage() {
  const page = INDEX_PAGES.kits;
  const { start, office, makers } = kitShelves();
  const shelves = [
    { id: "start", name: "はじめての方に", count: start.length },
    { id: "office", name: "事務の道具", count: office.length },
    { id: "makers", name: "制作者・開発者向け", count: makers.length },
  ];

  return (
    <main id="main" className={k.page}>
      <header className={`${u.wrap} ${k.head}`}>
        <h1 className={k.title}>{page.title}</h1>
        <p className={u.lede}>{page.lede}</p>
        <nav className={k.toc} aria-label="棚の目次">
          <ol className={k.tocList}>
            {shelves.map((shelf) => (
              <li key={shelf.id}>
                <a href={`#${shelf.id}`} className={k.tocItem}>
                  {shelf.name}
                  <span className={k.tocCount}>{shelf.count} 本</span>
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

      <section id="start" className={`${u.section} ${k.shelf}`} aria-labelledby="start-title">
        <div className={u.wrap}>
          <div className={u.sectionHead}>
            <h2 id="start-title" className={u.h2}>
              はじめての方におすすめの 3 本
            </h2>
            <p className={u.lede}>迷ったら、この 3 本から。どれも Google スプレッドシートで動き、月額の費用はかかりません。</p>
          </div>
          <KitGrid count={start.length} large label="はじめての方におすすめの 3 本">
            {start.map((project, i) => (
              <KitCard key={project.slug} project={project} large facts={KIT_FACTS[project.slug as FlagshipSlug].ja} eager={i === 0} />
            ))}
          </KitGrid>
          <div className={k.notes}>
            <p className={k.note}>
              <span className={k.noteHead}>無料版</span>
              <span>
                期限アラートには、3 日前と当日の期限だけを毎朝 Slack にお知らせする無料版「期限アラート ライト」があります。{" "}
                <a href={goHref("deadline-lite", "booth", "/kits")} rel="nofollow" className={u.link}>
                  BOOTH で受け取る
                </a>
              </span>
            </p>
            <p className={k.note}>
              <span className={k.noteHead}>{KIT_SET.name}</span>
              <span>
                {KIT_SET.slugs.map(titleOf).join("・")}は、{KIT_SET.name}（{yen(KIT_SET.price)}・単品の合計 {yen(kitSetListTotal())}）でもお求めいただけます。セットは、BOOTH の各キットのページで選べます。
              </span>
            </p>
          </div>
        </div>
      </section>

      <section id="office" className={`${u.section} ${k.shelf} ${k.tinted}`} aria-labelledby="office-title">
        <div className={u.wrap}>
          <div className={u.sectionHead}>
            <h2 id="office-title" className={u.h2}>
              事務の道具
            </h2>
            <p className={u.lede}>
              台帳の画面、数字のまとめ、AI による問い合わせの整理や書類の読み取り、LINE の窓口。AI を使うキットは、ご自身の API キーの利用料がかかります。
            </p>
          </div>
          <KitGrid count={office.length} label="事務の道具">
            {office.map((project) => (
              <KitCard key={project.slug} project={project} />
            ))}
          </KitGrid>
        </div>
      </section>

      <section id="makers" className={`${u.section} ${k.shelf}`} aria-labelledby="makers-title">
        <div className={u.wrap}>
          <div className={u.sectionHead}>
            <h2 id="makers-title" className={u.h2}>
              制作者・開発者向け
            </h2>
            <p className={u.lede}>サイトやサービスを作る方に向けた、土台と部品です。使っている技術を添えています。</p>
          </div>
          <KitGrid count={makers.length} label="制作者・開発者向け">
            {makers.map((project) => (
              <KitCard key={project.slug} project={project} showTags />
            ))}
          </KitGrid>
        </div>
      </section>

      <section id="updates" className={`${u.section} ${k.shelf}`} aria-labelledby="updates-title">
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
              設置まで任せたい方へ
            </h2>
            <p className={u.lede}>キットの設置をお任せいただく場合は 30,000 円からです。1 か所の修正は 5,000 円からお受けします。</p>
          </div>
          <Link href="/contact" className={u.btn}>
            頼み方と料金を見る
          </Link>
        </div>
      </section>
    </main>
  );
}
