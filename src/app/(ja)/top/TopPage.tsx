/*
 * THESIS: 事務の道具の店を、スプレッドシートと同じマス目の上に開く。作品集の一列（料紙）と、
 *   SaaS の LP の定番（大きな見出し・機能の箱・料金の三列）の両方を断る。
 * OWN-WORLD: 紙 #F6F3EB の地に白いセル、境目は墨 12% のマス目。見出しは明朝 600、本文はゴシック。
 *   朱は選択の枠（2px と右下の四角）と落款だけ。届いた 1 通は墨の面。
 * STORY: 一字一マスの見出しで「表に書けば、仕事が回る。」と言い切り、右の見本で日付を進めると届く 1 通が
 *   変わる。看板 3 本の値段を見て、品物のページか /kits へ進む。迷えば /contact。
 * FIRST VIEWPORT: PC は左右に割る。左に誰向けの一行・7×2 マスの見出し・二文・看板 3 本の行（値段つき）・
 *   「18 本のキットを見る」。右に期限アラートの動く見本。スマホは 1 列で、看板 3 本の行までが第一画面。
 * FORM: 方眼（自前の候補の 7 番目「原稿用紙・方眼」を、スプレッドシートの文法と合わせた。seed a9babaf7）
 */
import Link from "next/link";

import { ContactMail } from "@/components/track/ContactMail";
import { KitCard, KitGrid } from "@/components/site/KitCard";
import { PriceLadder } from "@/components/site/PriceLadder";
import u from "@/components/site/ui.module.css";
import { guideHref, guides } from "@/lib/guides";
import { FREE_EDITION, KIT_FACTS, type FlagshipSlug } from "@/lib/kit-facts";
import { priceNow, yen } from "@/lib/prices";
import {
  KIT_SET,
  categoryCount,
  kitSetListTotal,
  kitShelves,
  projectHref,
  type Project,
} from "@/lib/projects";
import { UPDATES, updateDate } from "@/lib/updates";

import { HeroSheet } from "./HeroSheet";
import s from "./top.module.css";

/** 看板 3 本の短い一行（トップの入口の行だけ。カードとページの一行はレジストリの説明） */
const HOOK: Record<FlagshipSlug, string> = {
  deadline: "期限を毎朝 1 通でお知らせします",
  form: "受付を記録して、自動で返信します",
  booking: "枠を書けば予約ページになります",
};

function listPrice(project: Project): string {
  const sale = project.sale;
  if (sale?.status !== "onsale" || sale.price == null) return "";
  return yen(priceNow(project.slug, sale.price).price);
}

function titleOf(slug: string, list: Project[]): string {
  return list.find((p) => p.slug === slug)?.title ?? slug;
}

export function TopPage() {
  const { start, office } = kitShelves();
  const kitCount = categoryCount("kits").total;
  const latest = UPDATES.slice(0, 4);
  const allKits = [...start, ...office, ...kitShelves().makers];
  const newestGuides = guides.slice(-3).reverse();

  return (
    <main id="main" className={s.page}>
      {/* ---- 第一画面 ---------------------------------------------------- */}
      <section className={s.hero} aria-labelledby="hero-title">
        <div className={`${u.wrap} ${s.heroGrid}`}>
          <div className={s.heroText}>
            <p className={s.kicker}>従業員 1〜30 人の会社・事務所・教室の事務に</p>
            {/* 一字一マス。字を span に割らず、字間で送りをマスの幅にそろえる（DESIGN.md の The Masu Rule） */}
            <h1 id="hero-title" className={s.masu}>
              表に書けば、
              <br />
              仕事が回る。
            </h1>
            <p className={s.lede}>
              期限の通知、問い合わせの受付、予約のページ。Google スプレッドシートで動く、買い切りの事務の道具です。月額のサービス料はかかりません。
            </p>

            <div className={s.picks}>
              <h2 className={s.picksHead}>はじめての方におすすめの 3 本</h2>
              <ol className={s.pickList}>
                {start.map((project, i) => (
                  <li key={project.slug} className={u.select}>
                    <Link href={projectHref(project)} className={s.pick}>
                      <span className={s.pickNo} aria-hidden="true">
                        {i + 1}
                      </span>
                      <span className={s.pickBody}>
                        <span className={s.pickName}>{project.title}</span>
                        <span className={s.pickHook}>{HOOK[project.slug as FlagshipSlug]}</span>
                      </span>
                      <span className={s.pickPrice}>
                        <span className={s.pickYen}>{listPrice(project)}</span>
                        {FREE_EDITION[project.slug] && <span className={s.pickFree}>無料版あり</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>

            <p className={s.ctas}>
              <Link href="/kits" className={u.btn}>
                {kitCount} 本のキットを見る
              </Link>
              <Link href="/contact" className={u.linkLine}>
                設置まで頼む（30,000 円〜）
              </Link>
            </p>
          </div>

          <div className={s.heroDemo}>
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

      {/* ---- 看板 3 本の中身 ---------------------------------------------- */}
      <section className={u.section} aria-labelledby="three-title">
        <div className={u.wrap}>
          <div className={u.sectionHead}>
            <h2 id="three-title" className={u.h2}>
              3 本の中身
            </h2>
            <p className={u.lede}>
              どれも Google スプレッドシートで動きます。手順書どおりに 15〜20 分ほどで置けて、月額の費用はかかりません。
            </p>
          </div>
          <KitGrid count={start.length} large label="はじめての方におすすめの 3 本">
            {start.map((project) => (
              <KitCard key={project.slug} project={project} large facts={KIT_FACTS[project.slug as FlagshipSlug].ja} />
            ))}
          </KitGrid>
          <p className={s.setLine}>
            {titleOf(KIT_SET.slugs[0], allKits)}・{titleOf(KIT_SET.slugs[1], allKits)}・{titleOf(KIT_SET.slugs[2], allKits)}
            は、{KIT_SET.name}（{yen(KIT_SET.price)}・単品の合計 {yen(kitSetListTotal())}）でもお求めいただけます。セットは、BOOTH の各キットのページで選べます。
          </p>
        </div>
      </section>

      {/* ---- ほかの事務の道具 ---------------------------------------------- */}
      <section className={`${u.section} ${s.office}`} aria-labelledby="office-title">
        <div className={u.wrap}>
          <div className={u.sectionHead}>
            <h2 id="office-title" className={u.h2}>
              ほかの事務の道具
            </h2>
            <p className={u.lede}>台帳の画面、数字のまとめ、AI による問い合わせの整理や書類の読み取り、LINE の窓口。</p>
          </div>
          <ul className={s.officeList}>
            {office.map((project) => (
              <li key={project.slug} className={u.select}>
                <Link href={projectHref(project)} className={s.officeRow}>
                  <span className={s.officeName}>{project.title}</span>
                  <span className={s.officeDesc}>{project.description}</span>
                  <span className={s.officePrice}>{listPrice(project)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className={s.more}>
            <Link href="/kits" className={u.linkLine}>
              {kitCount} 本すべてを、写真つきで見る
            </Link>
          </p>
        </div>
      </section>

      {/* ---- 頼み方と料金 ------------------------------------------------- */}
      <section className={u.section} aria-labelledby="ladder-title">
        <div className={`${u.wrap} ${s.ladderGrid}`}>
          <div className={u.sectionHead}>
            <h2 id="ladder-title" className={u.h2}>
              頼み方と料金
            </h2>
            <p className={u.lede}>キットをご自身で入れることも、設置ごとお任せいただくこともできます。1 か所の修正からお受けします。</p>
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
                  {titleOf(up.slug, allKits)} <span className={s.updateVer}>{up.version}</span>
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
              キットは、suminawa（墨縄）が個人で作っています。仕事では、Web システムの開発・保守、発注者側の SE、受託システムの品質保証、業務の自動化ツールの開発を、あわせて
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
                悩みから読む の一覧へ
              </Link>
            </p>
          </div>
        </div>
        <p className={`${u.wrap} ${s.makers}`}>
          Web 制作者・開発者の方へ。SaaS の土台・MCP サーバー・RAG の評価・3D の部品・LP のテンプレートは、
          <Link href="/kits#makers" className={u.link}>
            キットの一覧の後半
          </Link>
          にまとめています。
        </p>
      </section>
    </main>
  );
}
