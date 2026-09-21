/*
 * THESIS: 料紙の上に、窓を一つだけ開ける（Operate）。ここにある案内窓口は見本ではなく実物で、
 *   suminawa 自身の文書（売り物・受託・よくあるご質問）だけを根拠に答える。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。窓の中は部品の文法（--ac-* の値だけ料紙に寄せる）。
 * COLOR: 朱は落款だけ。窓の送信ボタンは墨。
 */
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import "@suminawa/ai-concierge/ai-concierge.css";

import links from "@/data/links.json";

import { fontVars } from "../fonts";
import s from "../projects.module.css";

export const metadata: Metadata = {
  title: "AI 案内窓口",
  description: "自社の文書だけを根拠に、サイトの上でお客さまの質問に答える窓口。出典つきで答え、分からないことは問い合わせへ回します",
  openGraph: { images: ["/og/ai-concierge.png"] },
  twitter: { card: "summary_large_image", images: ["/og/ai-concierge.png"] },
};

export default function AiConciergePage() {
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
          AI 案内窓口
          <span className={s.latin}>Concierge</span>
        </h1>
        <p className={s.lede}>
          自社の文書だけを根拠に答える窓口です。ここでは suminawa 自身の案内（売り物・受託の料金・進め方）を読んで答えます
        </p>
      </header>

      <div className={s.work}>
        <div
          id="suminawa-concierge"
          style={
            {
              "--ac-bg": "#fbf8f1",
              "--ac-fg": "#1c1a15",
              "--ac-muted": "#6a665d",
              "--ac-brand": "#1c1a15",
              "--ac-brand-fg": "#f4efe6",
              "--ac-border": "#d8d0c1",
              "--ac-radius": "4px",
              "--ac-font": "inherit",
              "--ac-shadow": "none",
            } as React.CSSProperties
          }
        />
        <Script
          src="/ai-concierge.js"
          strategy="afterInteractive"
          data-endpoint="/api/concierge"
          data-inline="#suminawa-concierge"
          data-greeting="こんにちは。suminawa の案内窓口です。売り物の内容や価格、受託の料金、進め方などをお答えします。"
          data-suggestions="AI 案内窓口キットは何ができますか|GAS の自動化はいくらからですか|買ったあとの更新は無料ですか"
          data-contact-url="#contact"
          data-storage-key="suminawa"
          data-max-input-chars="300"
        />

        <p className={s.lede} style={{ marginTop: "calc(2 * var(--rp-pitch))" }}>
          答えの末尾の番号は出典です。文書に無いことは「資料に載っていません」と答え、問い合わせへ回します。1 日の質問数には上限があります。
        </p>
        <p className={s.lede}>
          この窓口は「AI 案内窓口キット」（定価 ¥12,800 の買い切り）の実物です。文書は Markdown で書き、
          コマンド 1 つで索引を作り、サイトに 2 行貼るだけで置けます。Claude API の鍵はお客さまご自身のものを使います。
          {links["ai-concierge"].note && (
            <>
              {" ── "}
              <a href={links["ai-concierge"].note} className={s.textLink}>note</a>
            </>
          )}
          {links["ai-concierge"].booth && (
            <>
              {links["ai-concierge"].note ? " / " : " ── "}
              <a href={links["ai-concierge"].booth} className={s.textLink}>BOOTH</a>
            </>
          )}
        </p>
        <p className={s.lede} id="contact">
          ご依頼・ご相談は{" "}
          <a href="mailto:hello@suminawa.dev" className={s.textLink}>
            hello@suminawa.dev
          </a>{" "}
          へ。3 営業日以内に返信します。
        </p>
      </div>
    </main>
  );
}
