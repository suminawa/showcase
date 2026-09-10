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

export const metadata: Metadata = {
  title: "30日 — Thirty Days",
  description: "AIエージェントに全部やらせて、30日で1から稼げるだけ稼ぐ。売上・提案数・人間の介在時間を毎日足す公開の帳面。",
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
          AIエージェントに全部やらせて、30日で1から稼げるだけ稼ぐ。数字はここに毎日足す
          {links.challenge.note && (
            <>
              {" ── "}
              <a href={links.challenge.note}>毎日の記事</a>
            </>
          )}
        </p>
      </header>

      <div className={s.work}>
        <Board board={board} />
      </div>
    </main>
  );
}
