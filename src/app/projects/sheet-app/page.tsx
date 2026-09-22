/*
 * THESIS: スプレッドシート運用という実務を、料紙の上の【道具】として扱う（Operate）。
 *   間取りシミュレーターと同じ構えで、紙は床の間に退き、道具だけが載る。
 * OWN-WORLD: 頭（戻り・名乗り・一行）は料紙の文法そのまま。
 *   道具の中だけは別の世界で、色も字も道具自身が持つ（--sa-*）──
 *   額装が変わっても、掛かっている道具は変わらない。水盤と同じ理屈。
 * COLOR: 紙の側で色を持つのは朱の落款ひとつだけ。道具の中の緑は道具の色で、
 *   料紙には寄せない。
 * STORY: 検索すると一覧が絞れ、行を開くと詳細と編集が出る。
 * FIRST VIEWPORT: 頭（戻り・名乗り・一行）、その下に道具。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 * このページはサーバー部品のまま。道具（Tool）は "use client" のこの下だけに閉じる。
 */
import type { Metadata } from "next";
import Link from "next/link";

import links from "@/data/links.json";

import { fontVars } from "../fonts";
import s from "../projects.module.css";
import f from "./sheet-app.module.css";
import { Tool } from "./Tool";

export const metadata: Metadata = {
  title: "スプレッドシート業務アプリ",
  description:
    "スプレッドシートを台帳のまま、定義シートに列を書くだけで、一覧・検索・登録・編集の画面をスマートフォンでも。Apps Script の Web アプリとして公開するキットの見本。",
  openGraph: { images: ["/og/sheet-app.png"] },
  twitter: { card: "summary_large_image", images: ["/og/sheet-app.png"] },
};

export default function SheetAppPage() {
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
          スプレッドシート業務アプリ
          <span className={s.latin}>Sheet App</span>
        </h1>
        <p className={s.lede}>
          スプレッドシートの『定義』に列を書くだけで、顧客・案件・在庫の一覧・検索・登録・編集の画面になります
        </p>
      </header>

      <div className={s.work}>
        {/* 道具の中だけは自前の色と字を持つ。その根がこの一枚 */}
        <div className={f.tool}>
          <Tool />
        </div>
        <p className={s.lede} style={{ marginTop: "calc(2 * var(--rp-pitch))" }}>
          この見本は、キットに同梱の顧客管理のテンプレ（顧客 20
          件・対応履歴 30
          件）をブラウザの中で動かしています。登録や編集はページを閉じると消えます。実物は
          Google スプレッドシートを台帳にして、Apps Script の Web
          アプリとして公開します。
        </p>
        <p className={s.lede}>
          権限はスプレッドシートの共有設定がそのまま効き、サーバーも月額の利用料も要りません。AI（任意）を入れると、言葉での絞り込みと
          1 件の要約ができます。
        </p>
        <p className={s.lede}>
          この見本は「スプレッドシート業務アプリ キット」（定価 ¥9,800
          の買い切り。9 月 28 日までは発売記念 ¥8,800）の実物です。定義シートからの画面生成・CSV・AI
          の絞り込みと要約・見本 3 種つき
          {links["sheet-app"].note && (
            <>
              {" ── "}
              <a href={links["sheet-app"].note} className={s.textLink}>note</a>
            </>
          )}
          {links["sheet-app"].booth && (
            <>
              {links["sheet-app"].note ? " / " : " ── "}
              <a href={links["sheet-app"].booth} className={s.textLink}>BOOTH</a>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
