/*
 * THESIS: 会員制サービスの土台を、料紙の上の【道具】として扱う（Operate）。
 *   ダッシュボード キットと同じ構えで、紙は床の間に退き、道具だけが載る。
 * OWN-WORLD: 頭（戻り・名乗り・一行）は料紙の文法そのまま。
 *   道具の中だけは別の世界で、色も字も道具自身が持つ（--st-*）──
 *   額装が変わっても、掛かっている道具は変わらない。水盤と同じ理屈。
 * COLOR: 紙の側で色を持つのは朱の落款ひとつだけ。道具の中の青は道具の色で、
 *   料紙には寄せない。
 * STORY: 見本の方を選んで入ると、その役割で画面が変わる。
 *   プロジェクトを足し、上限に当たり、プランを選び、偽のお支払いを終えると上限が動く。
 * FIRST VIEWPORT: 頭（戻り・名乗り・一行）、見本の断りが一行、その下に道具。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 * このページはサーバー部品のまま。道具（Tool）は "use client" のこの下だけに閉じる。
 */
import type { Metadata } from "next";
import Link from "next/link";

import links from "@/data/links.json";

import { fontVars } from "../fonts";
import s from "../projects.module.css";
import { Tool } from "./Tool";

export const metadata: Metadata = {
  title: "SaaS スターター キット",
  description:
    "ログイン・組織・役割ごとの権限・プロジェクト・定期課金・法務のひな形まで入った、会員制サービスの土台。Next.js と Supabase と Stripe で始めるキットの見本。",
  openGraph: { images: ["/og/saas-starter.png"] },
  twitter: { card: "summary_large_image", images: ["/og/saas-starter.png"] },
};

export default function SaasStarterPage() {
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
          SaaS スターター キット
          <span className={s.latin}>SaaS Starter</span>
        </h1>
        <p className={s.lede}>
          会員制サービスに要るもの（ログイン・組織・権限・課金・法務）を、一式でお渡しします
        </p>
      </header>

      <div className={s.work}>
        <p className={s.lede}>
          この見本は、架空の会社「しおさい設計室」のデータを、ブラウザの中だけで動かしています。額の上で見本の方を切り替えると、その役割のままで画面が変わります。English
          を押すと、英語の画面に切り替わります。
        </p>

        {/* 道具の中だけは自前の色と字を持つ。その根が Tool の中の 1 枚 */}
        <Tool />

        <p className={s.lede} style={{ marginTop: "calc(2 * var(--rp-pitch))" }}>
          見本の方は 3
          名です。プロジェクトを足す・直す・消す、組織のお名前を変える、ご一緒に使う方の役割を変える、ご招待のリンクを発行する、プランを選んで偽のお支払いを終える、までをひととおりお試しいただけます。メンバーでお入りになると、ほかの方がお作りになったプロジェクトは消せず、ご招待の欄そのものが出ません。
        </p>
        <p className={s.lede}>
          どなたに何ができるかは、キットの中にある 1
          枚の表だけで決まります。画面もサーバーの処理も同じ表を読んでいるので、押せてしまったのに断られる、という食い違いが起きません。この見本で動いているのは、その表と処理そのもので、見本のために書き直したものではありません。
        </p>
        <p className={s.lede}>
          プロジェクトは無料のプランで 3
          件までです。上限に当たると案内に変わり、プランをお選びいただくと偽のお支払いの画面へ進みます。お支払いを終えると、本物と同じ道（決済の通知）を通ってご契約が入り、上限が
          50 件に変わります。
        </p>
        <p className={s.lede}>
          本物では、ここに Supabase と Stripe
          がつながります。この見本はブラウザの中だけで動くので、通信は 1
          本も行いません。お選びいただいた内容はどこにも送らず、読み込み直すと、はじめの見本に戻ります。ご登録の画面、ご招待をお受けになる流れ、運営の画面は、見本には入れておりません。
        </p>
        <p className={s.lede}>
          キットは Next.js（App Router）と TypeScript
          で、ログイン、組織とご招待、役割ごとの権限、プロジェクトの管理、Stripe
          の定期課金、法務の 3
          枚のひな形、日本語と英語の切り替えが入っています。画面とサーバーの処理は 4
          つの口だけを見る作りなので、つなぎ先を入れ替えても、画面はそのままお使いいただけます。
        </p>
        <p className={s.lede}>
          このキットは発売の準備中です（定価 ¥19,800。発売から 7 日間は発売記念
          ¥16,800）
          {links["saas-starter"].note && (
            <>
              {" ── "}
              <a href={links["saas-starter"].note} className={s.textLink}>
                note
              </a>
            </>
          )}
          {links["saas-starter"].booth && (
            <>
              {links["saas-starter"].note ? " / " : " ── "}
              <a href={links["saas-starter"].booth} className={s.textLink}>
                BOOTH
              </a>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
