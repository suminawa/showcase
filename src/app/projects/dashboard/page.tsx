/*
 * THESIS: 数字を眺めるという実務を、料紙の上の【道具】として扱う（Operate）。
 *   予約ページ・業務アプリと同じ構えで、紙は床の間に退き、道具だけが載る。
 * OWN-WORLD: 頭（戻り・名乗り・一行）は料紙の文法そのまま。
 *   道具の中だけは別の世界で、色も字も道具自身が持つ（--db-*）──
 *   額装が変わっても、掛かっている道具は変わらない。水盤と同じ理屈。
 * COLOR: 紙の側で色を持つのは朱の落款ひとつだけ。道具の中の系列の色は道具の色で、
 *   料紙には寄せない（色覚の差があっても見分けられる並びを崩さないため）。
 * STORY: 期間と区分で絞ると、数字の札・折れ線・棒・目標・表が同時に変わる。
 *   折れ線に触れると縦の線が付いてきて、その日の値がまとめて読める。
 * FIRST VIEWPORT: 頭（戻り・名乗り・一行）、見本の断りが一行、その下に道具。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 * このページはサーバー部品のまま。道具（Tool）は "use client" のこの下だけに閉じる。
 */
import type { Metadata } from "next";
import Link from "next/link";

import links from "@/data/links.json";

import { fontVars } from "../fonts";
import s from "../projects.module.css";
import f from "./dashboard.module.css";
import { Tool } from "./Tool";

export const metadata: Metadata = {
  title: "ダッシュボード キット",
  description:
    "スプレッドシートや CSV の数字を、設定を書くだけで KPI・グラフ・表の画面にするキットの見本。",
  openGraph: { images: ["/og/dashboard.png"] },
  twitter: { card: "summary_large_image", images: ["/og/dashboard.png"] },
};

export default function DashboardPage() {
  return (
    <main className={`${s.paper} ${fontVars}`}>
      {/* 入りの一筆。紙の右上を掠めて画面外へ抜ける。道具には一度も掛からない */}
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
          ダッシュボード キット
          <span className={s.latin}>Dashboard</span>
        </h1>
        <p className={s.lede}>
          スプレッドシートや CSV の数字を、設定を書くだけで KPI・グラフ・表の画面にします
        </p>
      </header>

      <div className={s.work}>
        <p className={s.lede}>
          この見本は、架空のお店「しおかぜ珈琲店」の見本データをブラウザの中で動かしています。右上の
          English を押すと、英語の画面に切り替わります。
        </p>
        {/* 道具の中だけは自前の色と字を持つ。その根がこの一枚 */}
        <div className={f.tool}>
          <Tool />
        </div>
        <p className={s.lede} style={{ marginTop: "calc(2 * var(--rp-pitch))" }}>
          期間と区分で絞り込むと、下の数字・折れ線・棒・目標・表がいっしょに変わります。折れ線に触れると縦の線が付いてきて、その日の値をまとめて読めます。どのグラフも「表で見る」に切り替えられ、表は見出しを押して並べ替え、CSV
          でダウンロードできます。絞り込みは URL に残るので、同じ画面をそのまま人に渡せます。
        </p>
        <p className={s.lede}>
          部品は 5 つ（数字・折れ線・棒・目標・表）で、どこに何を出すかは設定に書くだけです。グラフのライブラリにも
          BI の月額にも頼らず、色は色覚の差があっても見分けられる 8
          色の並びにしてあります。キーボードだけでも操作でき、スマートフォンの幅にも暗い配色にも対応しています。
        </p>
        <p className={s.lede}>
          置き方は 3 つから選べます。いまのサイトに 2 行で埋め込む形、Next.js
          のテンプレ（データの置き場所はブラウザに出しません）、Google
          スプレッドシートからそのまま公開する形（見られるのは、そのスプレッドシートを見られる方だけ）。どれも同じ画面が出ます。
        </p>
        <p className={s.lede}>
          この見本は「ダッシュボード キット」（定価 ¥9,800 の買い切り。9 月 29
          日までは発売記念 ¥8,800）の実物です。サーバーも月額の費用もかかりません
          {links.dashboard.note && (
            <>
              {" ── "}
              <a href={links.dashboard.note} className={s.textLink}>
                note
              </a>
            </>
          )}
          {links.dashboard.booth && (
            <>
              {links.dashboard.note ? " / " : " ── "}
              <a href={links.dashboard.booth} className={s.textLink}>
                BOOTH
              </a>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
