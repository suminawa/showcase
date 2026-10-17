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
 */
import Link from "next/link";

import { ContactMail } from "@/components/track/ContactMail";
import { KitCard, KitGrid } from "@/components/site/KitCard";
import { PriceLadder } from "@/components/site/PriceLadder";
import u from "@/components/site/ui.module.css";
import { guideHref, guides } from "@/lib/guides";
import { KIT_FACTS, type FlagshipSlug } from "@/lib/kit-facts";
import { priceNow, yen } from "@/lib/prices";
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

function listPrice(project: Project): string {
  const sale = project.sale;
  if (sale?.status === "free") return "無料";
  if (sale?.status !== "onsale" || sale.price == null) return "";
  return yen(priceNow(project.slug, sale.price).price);
}

const bySlug = new Map(projects.map((p) => [p.slug, p]));
const titleOf = (slug: string) => bySlug.get(slug)?.title ?? slug;

export function TopPage() {
  const start = featuredProjects();
  const kitCount = categoryCount("kits").total;
  const latest = UPDATES.slice(0, 4);
  const newestGuides = guides.slice(-3).reverse();

  return (
    <main id="main" className={s.page}>
      {/* ---- 第一画面: 名乗りと三つの柱 ------------------------------------ */}
      <section className={s.hero} aria-labelledby="hero-title">
        <div className={u.wrap}>
          <p className={s.kicker}>従業員 1〜30 人の会社・事務所・教室に</p>
          <div className={s.heroHead}>
            {/* 一字一マス（6 列 × 3 段、柱ごとに 1 段）。字を span に割らず、字間で送りをマスの幅にそろえる（DESIGN.md の The Masu Rule）。
                英字は原稿用紙と同じ扱いで、2 字は 1 マス（AI）、3 字は 2 マス（Web）に置く */}
            <h1 id="hero-title" className={s.masu}>
              業務自動化、
              <br />
              <span className={s.latin}>AI</span>活用、
              <br />
              <span className={`${s.latin} ${s.latin2}`}>Web</span>制作。
            </h1>
            <div className={s.heroText}>
              <p className={s.lede}>{copy.ja.pitchText}</p>
              <p className={s.ctas}>
                <Link href="/kits" className={u.btn}>
                  {kitCount} 本のキットを見る
                </Link>
                <Link href="/contact" className={u.linkLine}>
                  頼み方と料金
                </Link>
              </p>
            </div>
          </div>

          {/* 三つの柱。PC は 3 列、スマホは 1 列。柱ごとに 名・一行・代表のキット（値段つき）・棚への道・動く見本・受託の一行 */}
          <div className={s.pillars}>
            {PILLARS.map((pillar) => {
              const picks = pillar.picks.map((pick) => ({ ...pick, project: bySlug.get(pick.slug)! }));
              return (
                <section key={pillar.id} className={s.pillar} aria-labelledby={`pillar-${pillar.id}`}>
                  <div className={s.pillarHead}>
                    <h2 id={`pillar-${pillar.id}`} className={s.pillarName}>
                      {pillar.name}
                    </h2>
                    <p className={s.pillarLede}>{pillar.lede}</p>
                  </div>
                  <p className={s.picksHead}>
                    代表のキット<span className={s.picksTax}>税込・買い切り</span>
                  </p>
                  <ol className={s.pickList}>
                    {picks.map((pick, i) => (
                      <li key={pick.slug} className={u.select}>
                        <Link href={projectHref(pick.project)} className={s.pick}>
                          <span className={s.pickNo} aria-hidden="true">
                            {i + 1}
                          </span>
                          <span className={s.pickBody}>
                            <span className={s.pickName}>{pick.project.title}</span>
                            <span className={s.pickHook}>{pick.hook}</span>
                          </span>
                          <span className={s.pickPrice}>{listPrice(pick.project)}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                  {/* 柱の下の三行（帳票の体）: 一覧 → 棚、動く見本 → 見本、受託 → 頼み方と料金。行ごと押せる */}
                  <ul className={s.pillarLinks}>
                    <li>
                      <Link href={`/kits#${pillar.id}`} className={s.pillarLink}>
                        <span className={s.pillarLinkLabel}>一覧</span>
                        <span className={s.pillarLinkText}>{pillarKits(pillar).length} 本をすべて見る</span>
                      </Link>
                    </li>
                    <li>
                      <Link href={pillar.demo.href} className={s.pillarLink}>
                        <span className={s.pillarLinkLabel}>動く見本</span>
                        <span className={s.pillarLinkText}>{pillar.demo.label}</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact#ladder" className={s.pillarLink}>
                        <span className={s.pillarLinkLabel}>受託</span>
                        <span className={s.pillarLinkText}>
                          {pillar.service.label}
                          <span className={s.pillarPrice}>{pillar.service.price}（税別）</span>
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
              動く見本
            </h2>
            <p className={u.lede}>
              見本は実物で動きます。期限アラートの見本は、キットの関数がこの画面の中で毎朝の 1 通を作ります。日付を進めたり、期限や状態を書き換えたりすると、届く 1 通が変わります。
            </p>
            <ul className={s.demoList}>
              {PILLARS.filter((p) => p.id !== "automation").map((pillar) => (
                <li key={pillar.id}>
                  <Link href={pillar.demo.href} className={s.demoLink}>
                    <span className={s.demoPillar}>{pillar.short}</span>
                    {pillar.demo.label}
                  </Link>
                </li>
              ))}
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
            買う前に確かめられること
          </h2>
          <ul className={s.factGrid}>
            <li className={s.fact}>
              <span className={s.factFig}>0 円</span>
              <span className={s.factLabel}>月額のサービス料</span>
              <span className={s.factText}>キットは買い切りです。AI を使うキットは、ご自身の API キーの利用料がかかります。</span>
            </li>
            <li className={s.fact}>
              <span className={s.factFig}>実物</span>
              <span className={s.factLabel}>見本の中身</span>
              <span className={s.factText}>
                期限アラートとフォーム受付の見本は、キットの関数をこのサイトの中で動かしています。予約ページは、キットの見本の画面そのものです。
              </span>
            </li>
            <li className={s.fact}>
              <span className={s.factFig}>3 営業日</span>
              <span className={s.factLabel}>ご相談への返信</span>
              <span className={s.factText}>ご相談とご質問には、3 営業日以内にお返事します。</span>
            </li>
            <li className={s.fact}>
              <span className={s.factFig}>14 日</span>
              <span className={s.factLabel}>ご購入後のサポート</span>
              <span className={s.factText}>ご購入から 14 日は、手順書どおりに動かないとき、メールで設置まで一緒に確かめます。</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ---- 看板 3 本の中身（業務自動化の柱の先頭） ------------------------ */}
      <section className={u.section} aria-labelledby="three-title">
        <div className={u.wrap}>
          <div className={u.sectionHead}>
            <h2 id="three-title" className={u.h2}>
              はじめての方におすすめの 3 本
            </h2>
            <p className={u.lede}>
              業務自動化の柱の先頭の 3 本です。どれも Google スプレッドシートで動きます。手順書どおりに 15〜20 分ほどで使い始められ、月額の費用はかかりません。
            </p>
          </div>
          <KitGrid count={start.length} large label="はじめての方におすすめの 3 本">
            {start.map((project) => (
              <KitCard key={project.slug} project={project} large facts={KIT_FACTS[project.slug as FlagshipSlug].ja} />
            ))}
          </KitGrid>
          <p className={s.setLine}>
            {KIT_SET.label}の 3 本は、まとめて {yen(KIT_SET.price)}（税込。単品の合計 {yen(kitSetListTotal())}）でもお求めいただけます。セットは、BOOTH の各キットのページで選べます。
          </p>
          <p className={s.more}>
            <Link href="/kits" className={u.linkLine}>
              {kitCount} 本すべてを、写真つきで見る
            </Link>
          </p>
        </div>
      </section>

      {/* ---- 頼み方と料金 ------------------------------------------------- */}
      <section className={`${u.section} ${s.ladder}`} aria-labelledby="ladder-title">
        <div className={`${u.wrap} ${s.ladderGrid}`}>
          <div className={u.sectionHead}>
            <h2 id="ladder-title" className={u.h2}>
              頼み方と料金
            </h2>
            <p className={u.lede}>キットをご自身で入れることも、設置・AI の組み込み・LP やサイトの制作をお任せいただくこともできます。1 か所の修正からお受けします。</p>
            <p className={s.ladderCta}>
              <Link href="/contact" className={u.btn}>
                相談する（3 営業日以内に返信）
              </Link>
            </p>
            <p className={u.small}>
              メールでのご相談は <ContactMail className={u.link} /> へ。
            </p>
          </div>
          <div className={s.tableWrap}>
            <PriceLadder />
          </div>
        </div>
      </section>

      {/* ---- 更新の記録 ---------------------------------------------------- */}
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

      {/* ---- 作っている人・悩みから読む ------------------------------------- */}
      <section className={`${u.section} ${s.closing}`} aria-label="作っている人と読みもの">
        <div className={`${u.wrap} ${s.closingGrid}`}>
          <div className={s.maker}>
            <h2 className={u.h2}>作っている人</h2>
            <p className={u.lede}>
              キットとサイトは、suminawa（墨縄）が個人で作っています。仕事では、Web システムの開発・保守、発注者側の SE、受託システムの品質保証、業務の自動化ツールの開発を、あわせて
              3 年以上担当してきました。
            </p>
            <p className={u.lede}>作るときは AI エージェントを使い、動作は自分で確かめてから出しています。</p>
            <p>
              <Link href="/about" className={u.linkLine}>
                運営者について（お取引の決まり・プライバシー方針）
              </Link>
            </p>
          </div>
          <div className={s.reads}>
            <h2 className={u.h2}>悩みから読む</h2>
            <ul className={s.readList}>
              {newestGuides.map((g) => (
                <li key={g.slug}>
                  <Link href={guideHref(g)} className={s.read}>
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
            <p>
              <Link href="/guides" className={u.linkLine}>
                悩みから読むの一覧へ
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
