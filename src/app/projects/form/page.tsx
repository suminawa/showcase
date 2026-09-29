/*
 * THESIS: 送信先を持つということを、送って確かめさせる（Operate）。
 *   最初の画面は「キットがすること」── 受付シートの 1 行・通知・自動返信。その横で本物のフォームを送れる。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。道具の中は帳面の法（components/kit-demo/kit-demo.module.css）。
 * COLOR: 朱は落款と、bot のふりの印が点いたときだけ。断った文も墨の濃さだけで語る。
 * TRUTH: 検証・受付番号・行・通知・自動返信は、キットの src/ の写し（./kit/）がこの画面の中で作る。
 *   どこにも送らず、何も保存しない（ページにもそう書く）。
 */
import type { Metadata } from "next";
import Link from "next/link";

import { KitClose, KitPriceLine } from "@/components/kit-demo/KitClose";

import { fontVars } from "../fonts";
import s from "../projects.module.css";
import { FormDemo } from "./FormDemo";

export const metadata: Metadata = {
  title: "フォーム受付 GAS キット",
  description:
    "サイトのフォームの送信先になる Apps Script のキットの見本です。送ると、受付シートの 1 行・Slack などへの通知・自動返信がその場で見られます（どこにも送りません）。",
  alternates: { canonical: "/projects/form" },
};

export default function FormPage() {
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
          フォーム受付 GAS キット
          <span className={s.latin}>Form Intake</span>
        </h1>
        <p className={s.lede}>
          サイトのフォームから届いた内容をスプレッドシートに 1 行ずつ貯め、Slack・Discord・LINE にお知らせし、送った方へ自動で返信します。
        </p>
      </header>

      <div className={s.work}>
        <KitPriceLine slug="form" />
        <FormDemo />
        <KitClose
          slug="form"
          made="受付番号・シートの行・通知・自動返信・断るときの文は、キットに入っている src/ の関数をこのページの中でそのまま動かして作っています。見えない欄による迷惑投稿よけ、10 分以内の二重送信の防止、枠ごとの定員もキットと同じ働きです。キットでは、同じ関数が Google のウェブアプリとして送信を受けます。"
        />
      </div>
    </main>
  );
}
