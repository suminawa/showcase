/*
 * THESIS: 見積もりという実務を、料紙の上の【帳面】として扱う（Operate）。
 *   表現がタスクを曇らせてはいけないので、料紙の法のうち「紙が八割」「動くのは一つ」は
 *   持ち込まない。引き継ぐのは、字が大と小の二段しか無いこと・箱を持たないこと・
 *   線は手の線であることの三つだけ。
 * OWN-WORLD: 枠も罫も背景色の切り替えも置かない。構造は縦の余白（すべて界線の
 *   間隔の整数倍）と、字の濃さだけが作る。数字だけが「大」の帯に立つ。
 * COLOR: 朱に役を一つ与えている ── 【朱は選ばれていることの印】。
 *   単価方式の選択とオプションのチェックにだけ点く。朱入れも捺印も、もともと
 *   「決めた」ことを示す色だった。墨は書かれたもの、朱は決めたもの。
 *   ＊ 朱を強調や注意に使い始めるとこの理屈は壊れる。選択以外に使わないこと。
 * STORY: 触れた数だけ朱が点り、右の合計が追いつく。
 * FIRST VIEWPORT: 頭（戻り・名乗り・一行）、左に記入、右に内訳と合計。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 */
import type { Metadata } from "next";
import Link from "next/link";

import { QuoteSimulator } from "@/components/quote-simulator/QuoteSimulator";
import links from "@/data/links.json";

import { fontVars } from "../fonts";
import s from "../projects.module.css";

export const metadata: Metadata = {
  title: "見積もりシミュレーター",
  description:
    "作業条件を入力すると、見積もりの内訳と合計がリアルタイムで見える電卓",
  openGraph: { images: ["/og/quote-simulator.png"] },
  twitter: { card: "summary_large_image", images: ["/og/quote-simulator.png"] },
};

export default function QuoteSimulatorPage() {
  return (
    <main className={`${s.paper} ${fontVars}`}>
      {/* 入りの一筆。紙の右上を掠めて画面外へ抜ける。帳面には一度も掛からない */}
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
          見積もりシミュレーター
          <span className={s.latin}>Quote</span>
        </h1>
        <p className={s.lede}>条件を入れると、その場で内訳が見えます</p>
      </header>

      <div className={s.work}>
        <QuoteSimulator />
        <p className={s.lede} style={{ marginTop: "calc(2 * var(--rp-pitch))" }}>
          この電卓を自分のサイトに置ける版（¥1,980）
          {links.s1.note && (
            <>
              {" ── "}
              <a href={links.s1.note} className={s.textLink}>note</a>
            </>
          )}
          {links.s1.booth && (
            <>
              {links.s1.note ? " / " : " ── "}
              <a href={links.s1.booth} className={s.textLink}>BOOTH</a>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
