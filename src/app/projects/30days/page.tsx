/*
 * THESIS: 帳面をもう一冊。見積もりの帳面が「決める」ためのものなら、この帳面は「起きたことを足す」ためのもの（Operate）。
 * OWN-WORLD: 料紙の作品ページ。字は大と小の二段、箱なし、罫は墨の一本。合計だけが大に立つ。
 * COLOR: 朱は使わない（この面に「選ぶ」行為が無いから）。折れ線も墨の一色。
 * STORY: 毎晩、一行ずつ増える。
 * FIRST VIEWPORT: 頭（戻り・名乗り・一行）、累計、四つの小さな数、折れ線、表の頭。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 */
import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";

import { Board } from "@/components/thirtydays/Board";
import board from "@/data/thirtydays.json";
import links from "@/data/links.json";

import { fontVars } from "../fonts";
import s from "../projects.module.css";

/** チャレンジの中で出した売り物。URL は links.json（空なら出さない） */
const PRODUCTS = [
  { name: "見積もり電卓テンプレ", links: links.s1 },
  { name: "期限アラート GAS キット", links: links.s2 },
  { name: "フォーム受付 GAS キット", links: links.s3 },
  { name: "業種別 LP テンプレ パック", links: links.lp },
  { name: "間取りシミュレーター", links: links.floorplan },
];

export const metadata: Metadata = {
  title: "30日 — Thirty Days",
  description:
    "AIエージェントに全部やらせて、30日で1から稼げるだけ稼ぐ。売上・提案数・人間の介在時間を毎日足していく公開の帳面。",
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
          <br />
          {PRODUCTS.map((product, index) => (
            <Fragment key={product.name}>
              {index > 0 && "・"}
              <span className={s.product}>
                {product.name}
                {product.links.note && (
                  <>
                    {" "}
                    <a href={product.links.note} className={s.textLink}>
                      note
                    </a>
                  </>
                )}
                {product.links.booth && (
                  <>
                    {product.links.note ? " / " : " "}
                    <a href={product.links.booth} className={s.textLink}>
                      BOOTH
                    </a>
                  </>
                )}
              </span>
            </Fragment>
          ))}
        </p>
      </header>

      <div className={s.work}>
        <Board board={board} />
      </div>
    </main>
  );
}
