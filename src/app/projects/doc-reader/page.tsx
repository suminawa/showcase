/*
 * THESIS: 料紙の上に、窓を一つだけ開ける（Operate）。ここにある読み取りは見本ではなく実物で、
 *   同梱の書類 5 枚は鍵なしでも読み取れる。自分の書類は、鍵が置かれるまでは
 *   「いまは読み取れません」側に落ちる ── 見せかけの成功を作らない。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。窓の中は部品の文法（doc-reader.module.css の --dr-* だけ料紙に寄せる）。
 * COLOR: 朱は落款だけ。窓の中に選ぶ行為が無いので、朱は一切使わない。
 */
import type { Metadata } from "next";
import Link from "next/link";

import { fontVars } from "../fonts";
import s from "../projects.module.css";
import { DocReaderDemo } from "./DocReaderDemo";

export const metadata: Metadata = {
  title: "AI 書類読み取り",
  description: "請求書・領収書・申込書を読み取り、確認してから表に出す道具です。同梱の見本と、お手元の書類でその場から試せます。",
};

export default function DocReaderPage() {
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
          AI 書類読み取り
          <span className={s.latin}>Document Reader</span>
        </h1>
        <p className={s.lede}>請求書・領収書・申込書を読み取り、確認してから表に出す道具です</p>
      </header>

      <div className={s.work}>
        <DocReaderDemo />

        <p className={s.lede} style={{ marginTop: "calc(2 * var(--rp-pitch))" }}>
          読み取った結果はこのブラウザの中にだけ残り、サーバーには保存しません。1 日の枚数には上限があります。
        </p>
        <p className={s.lede}>
          この道具は「AI 書類読み取りキット」（2026 年 9 月 21 日発売予定、定価 ¥16,800）の実物です。帳票の型を JSON で書き、確認画面つきの Next.js テンプレを Vercel に置くと、自社の鍵で動きます。
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
