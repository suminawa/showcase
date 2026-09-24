/*
 * THESIS: 帳面をもう一冊。見積もりの帳面が「決める」ためのものなら、この帳面は「起きたことを足す」ためのもの（Operate）。
 * OWN-WORLD: 料紙の作品ページ。字は大と小の二段、箱なし、罫は墨の一本。合計だけが大に立つ。
 * COLOR: 朱は使わない（この面に「選ぶ」行為が無いから）。折れ線も墨の一色。
 * STORY: 毎晩、一行ずつ増える。
 * FIRST VIEWPORT: 頭（戻り・名乗り・一行）、累計、四つの小さな数、折れ線、表の頭。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 */
import type { Metadata } from "next";
import Link from "next/link";

import { Board } from "@/components/thirtydays/Board";
import board from "@/data/thirtydays.json";
import links from "@/data/links.json";

import { fontVars } from "../fonts";
import s from "../projects.module.css";

/** チャレンジの中で出した売り物（発売順）。URL は links.json（空なら値札を出さない） */
const PRODUCTS = [
  { name: "見積もり電卓テンプレ", date: "9/11", links: links.s1 },
  { name: "期限アラート GAS キット", date: "9/12", links: links.s2 },
  { name: "フォーム受付 GAS キット", date: "9/13", links: links.s3 },
  { name: "業種別 LP テンプレ パック", date: "9/14", links: links.lp },
  { name: "間取りシミュレーター", date: "9/16", links: links.floorplan },
  { name: "AI 案内窓口キット", date: "9/21", links: links["ai-concierge"] },
  { name: "AI 書類読み取りキット", date: "9/21", links: links["doc-reader"] },
  { name: "スプレッドシート業務アプリ キット", date: "9/22", links: links["sheet-app"] },
  { name: "予約ページ キット", date: "9/22", links: links.booking },
  { name: "AI 問い合わせ整理キット", date: "9/23", links: links["inbox-triage"] },
  { name: "ダッシュボード キット", date: "9/23", links: links.dashboard },
  { name: "LINE 案内窓口キット", date: "9/24", links: links["line-concierge"] },
];

export const metadata: Metadata = {
  title: "30日 — Thirty Days",
  description:
    "AIエージェントに全部やらせて、30日で1から稼げるだけ稼ぐ。売上・提案数・人間の介在時間を毎日足していく公開の帳面。",
  openGraph: { images: ["/og/30days.png"] },
  twitter: { card: "summary_large_image", images: ["/og/30days.png"] },
};

export default function ThirtyDaysPage() {
  return (
    <main className={`${s.paper} ${fontVars}`}>
      <div className={s.stroke} aria-hidden="true">
        <span className={`${s.ink} ${s.inkKasure}`} />
        <span className={`${s.ink} ${s.inkCore}`} />
      </div>

      <header className={s.head}>
        <Link href="/" className={s.back}>
          <span className={s.seal} aria-hidden="true">
            墨
          </span>
          Showcase へ戻る
        </Link>
        <h1 className={s.title}>
          30日
          <span className={s.latin}>Thirty Days</span>
        </h1>
        <p className={s.lede}>
          AIエージェントに全部やらせて、30日で1から稼げるだけ稼ぐ。
          <br />
          数字はここに毎日足す
          {links.challenge.note && (
            <>
              {" ── "}
              <a href={links.challenge.note} className={s.textLink}>
                毎日の記事
              </a>
            </>
          )}
        </p>
      </header>

      <div className={s.work}>
        <Board board={board} products={PRODUCTS} />
      </div>
    </main>
  );
}
