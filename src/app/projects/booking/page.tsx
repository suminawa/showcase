/*
 * THESIS: 予約という実務を、料紙の上の【道具】として扱う（Operate）。
 *   スプレッドシート業務アプリと同じ構えで、紙は床の間に退き、道具だけが載る。
 * OWN-WORLD: 頭（戻り・名乗り・一行）は料紙の文法そのまま。
 *   道具の中だけは別の世界で、色も字も道具自身が持つ（--bk-*）──
 *   額装が変わっても、掛かっている道具は変わらない。水盤と同じ理屈。
 * COLOR: 紙の側で色を持つのは朱の落款ひとつだけ。道具の中の緑は道具の色で、
 *   料紙には寄せない。
 * STORY: 空きカレンダーで日を選ぶと時間が出て、名前と連絡先を入れ、確認して予約が済む。
 * FIRST VIEWPORT: 頭（戻り・名乗り・一行）、見本の断りが一行、その下に道具。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 * このページはサーバー部品のまま。道具（Tool）は "use client" のこの下だけに閉じる。
 */
import type { Metadata } from "next";
import Link from "next/link";

import links from "@/data/links.json";

import { fontVars } from "../fonts";
import s from "../projects.module.css";
import f from "./booking.module.css";
import { Tool } from "./Tool";

export const metadata: Metadata = {
  title: "予約ページ キット",
  description:
    "スプレッドシートに枠を書くだけで、公開した URL がそのまま予約ページになる Apps Script のキットの見本。",
  openGraph: { images: ["/og/booking.png"] },
  twitter: { card: "summary_large_image", images: ["/og/booking.png"] },
};

export default function BookingPage() {
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
          予約ページ キット
          <span className={s.latin}>Booking</span>
        </h1>
        <p className={s.lede}>
          スプレッドシートに枠を書くだけで、公開した URL がそのまま予約ページになります
        </p>
      </header>

      <div className={s.work}>
        <p className={s.lede}>
          この見本は、架空のお店「ひだまり整体院」の見本データをブラウザの中で動かしています。ご予約はページを閉じると消えます。
        </p>
        {/* 道具の中だけは自前の色と字を持つ。その根がこの一枚 */}
        <div className={f.tool}>
          <Tool />
        </div>
        <p className={s.lede} style={{ marginTop: "calc(2 * var(--rp-pitch))" }}>
          お客さまは空きカレンダーから日を選び、時間を選び、お名前と連絡先を入れて、確認をはさんでご予約いただけます。Google
          アカウントもログインも要りません。受け付けたご予約は「予約」シートに 1
          行たまり、お客さまへ確認メール、お店へお知らせのメールが届きます。前日のリマインドも自動で送れます。
        </p>
        <p className={s.lede}>
          Google
          カレンダーへの登録は任意で、設定を空にしておけば登録しません。キャンセルは確認メールに書かれた
          URL
          からお客さまご自身で手続きでき、締切は設定で決められます。Slack・Discord・LINE
          への通知も、設定に URL
          を入れれば届きます。所要時間の違うサービスを並べて選んでいただくこともでき、画面はスマートフォンを先に考えた作りです。
        </p>
        <p className={s.lede}>
          置き方は、スプレッドシートを作り、dist/Code.gs と dist/App.html
          を貼って、ウェブアプリとして公開（全員・自分として実行）するだけです。メニューの「初期化」→「見本を入れる」→「予約ページの
          URL」で動きます（15 分）。
        </p>
        <p className={s.lede}>
          この見本は「予約ページ キット」（定価 ¥7,980 の買い切り。9 月 28
          日までは発売記念 ¥6,980）の実物です。サーバーも月額の費用もかかりません
          {links.booking.note && (
            <>
              {" ── "}
              <a href={links.booking.note} className={s.textLink}>
                note
              </a>
            </>
          )}
          {links.booking.booth && (
            <>
              {links.booking.note ? " / " : " ── "}
              <a href={links.booking.booth} className={s.textLink}>
                BOOTH
              </a>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
