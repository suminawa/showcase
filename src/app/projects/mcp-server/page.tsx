/*
 * THESIS: スプレッドシートの台帳を、AI との会話から触れるようにする道具の見本（Operate）。
 *   実物の MCP サーバーはブラウザでは動かないので、キットを見本のデータで動かして記録した
 *   やり取りを、1 手ずつ再生する。見せたいのは「AI が何を呼び、何が返り、どう答えたか」。
 * OWN-WORLD: 頭（戻り・名乗り・一行）は料紙の文法そのまま。再生の中は紙の上に置いた
 *   一枚の帳面で、枠は髪の毛ほどの線一本。ツール名と引数と JSON だけが等幅の字を持つ（中身がコードだから）。
 * COLOR: 朱は戻りの落款と、「選んでいる」ことの印（問いと設定の切り替え）だけ。
 * STORY: 問いを選ぶ → ツールの呼び出しと結果 → 答え。「読むだけ／書く」を切り替えると、
 *   書くツールが一覧に出たり消えたりし、書く問いへの答えが変わる。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 * このページはサーバー部品のまま。再生（Replay）だけが "use client"。
 */
import type { Metadata } from "next";
import Link from "next/link";

import links from "@/data/links.json";
import { projects, saleLabel } from "@/lib/projects";

import { fontVars } from "../fonts";
import s from "../projects.module.css";
import { Diagram } from "./Diagram";
import m from "./mcp-server.module.css";
import { Replay } from "./Replay";

/** キットを MCP_DEMO=1 で起こし、stdio で tools/list と tools/call を記録したもの */
const RECORDING_SRC = "/demos/mcp-server/exchanges.json";

const project = projects.find((p) => p.slug === "mcp-server");
if (!project?.sale) throw new Error("レジストリに mcp-server の sale がない");
const sale = project.sale;
const onSale = sale.status === "onsale";
const shop = links["mcp-server"];

export const metadata: Metadata = {
  title: "MCP サーバー キット",
  description:
    "業務アプリ・予約ページ・書類読み取りのスプレッドシートを、Claude や ChatGPT との会話から探したり登録したりできるようにする MCP サーバーのキット。記録したやり取りを再生する見本。",
};

export default function McpServerPage() {
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
          MCP サーバー キット
          <span className={s.latin}>MCP Server</span>
        </h1>
        <p className={s.lede}>
          お使いのスプレッドシートの顧客・予約・書類を、Claude や ChatGPT との会話から探したり、登録したりできるようにします
        </p>
        <p className={`${s.lede} ${m.sale}`}>{saleLabel(sale, { detail: true })}</p>
      </header>

      <div className={s.work}>
        <section className={m.section} aria-labelledby="replay-heading">
          <h2 id="replay-heading" className={m.heading}>
            会話の再生
          </h2>
          <p className={m.text}>
            記録したやり取りを再生しています。データはすべて架空です。キットを見本のデータで動かし、AI のアプリと同じつなぎ方（stdio）で呼んだツールと、返った結果をそのまま載せています。答えの文は、結果をもとに書いた例です。
          </p>
          <Replay src={RECORDING_SRC} />
        </section>

        <section className={m.section} aria-labelledby="how-heading">
          <h2 id="how-heading" className={m.heading}>
            仕組み
          </h2>
          <Diagram />
          <p className={m.text}>
            AI はスプレッドシートを直接は開きません。このサーバーが用意した「探す」「読む」「登録する」などのツールを呼び、サーバーが Google の Sheets API で読み書きします。Google の鍵も AI の契約もお客さまのもので、データをスプレッドシートの外に置くことはありません。サーバーの月額もかかりません。
          </p>
          <p className={m.text}>
            書くツールは、設定で <code className={m.inlineCode}>MCP_WRITE=true</code>{" "}
            にしたときだけ AI に見えます。既定は読むだけです。書くときも 1 回に 1 行で、Claude Desktop などの AI のアプリは、実行の前に「許可しますか」と確かめます。
          </p>
        </section>

        <section className={m.section} aria-labelledby="setup-heading">
          <h2 id="setup-heading" className={m.heading}>
            使い始めるまで
          </h2>
          <ol className={m.steps}>
            <li>
              <span className={m.stepTitle}>見本のデータで試す</span>
              <span className={m.stepText}>
                Claude Desktop の設定に 1 行足すだけで、Google の準備をする前に、この見本と同じデータで動きを確かめられます（<code className={m.inlineCode}>MCP_DEMO=1</code>）。
              </span>
            </li>
            <li>
              <span className={m.stepTitle}>Google の準備（15 分ほど）</span>
              <span className={m.stepText}>
                サービス アカウントを作ってスプレッドシートを共有し、<code className={m.inlineCode}>.env</code>{" "}
                にスプレッドシートの ID を書きます。<code className={m.inlineCode}>npm run check</code>{" "}
                で、つながり方と見出しの形を確かめられます。
              </span>
            </li>
            <li>
              <span className={m.stepTitle}>AI のアプリにつなぐ</span>
              <span className={m.stepText}>
                Claude Desktop・Claude Code・Cursor はお手元のパソコンでそのまま。ChatGPT と claude.ai のコネクタには、HTTP の入口を Cloudflare Tunnel で外に出してつなぎます。HTTP の入口は、合い言葉なしでは受け付けません。
              </span>
            </li>
          </ol>
        </section>

        <section className={m.section} aria-labelledby="not-heading">
          <h2 id="not-heading" className={m.heading}>
            しないこと
          </h2>
          <ul className={m.list}>
            <li>行は消しません。消す代わりに、状況や状態の列を更新します。</li>
            <li>予約の新規作成と、空き枠の案内はしません（見るのとキャンセルだけです）。</li>
            <li>
              AI からの変更では、キット側の通知・メール・Google カレンダーは動きません。予約をキャンセルにしたときは、お客さまへのご連絡と予定の削除を別に行ってください。
            </li>
            <li>LINE のユーザー ID・更新した人のメールアドレス・予約のキャンセル用の鍵は、AI に渡しません。</li>
            <li>書き込みは 1 分に 20 回までで、それを超える呼び出しは止めます。</li>
          </ul>
        </section>

        <section className={m.section} aria-labelledby="buy-heading">
          <h2 id="buy-heading" className={m.heading}>
            購入と導入代行
          </h2>
          <p className={m.text}>
            {onSale
              ? `MCP サーバー キット（${saleLabel(sale)}、買い切り）`
              : `MCP サーバー キットは発売前です（${saleLabel(sale, { detail: true })}、買い切り）。`}
            TypeScript のソース・ビルド済みのファイル・説明書・設定の見本を zip 1 本でお渡しします。業務アプリ・予約ページ・書類読み取りのキットと組むと、画面と会話の両方から同じ台帳を使えます。
            {shop.note && (
              <>
                {" ── "}
                <a href={shop.note} className={s.textLink}>
                  note
                </a>
              </>
            )}
            {shop.booth && (
              <>
                {shop.note ? " / " : " ── "}
                <a href={shop.booth} className={s.textLink}>
                  BOOTH
                </a>
              </>
            )}
          </p>
          <p className={m.text}>
            サービス アカウントの準備から、Claude Desktop や ChatGPT へのつなぎ込み、Cloudflare の名前つきトンネルの設定までを、こちらで行うこともできます。 ──{" "}
            <Link href="/contact" className={s.textLink}>
              制作のご相談
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
