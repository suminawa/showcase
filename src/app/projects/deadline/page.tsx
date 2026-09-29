/*
 * THESIS: 毎朝届く 1 通を、料紙の上で先に読ませる（Operate）。
 *   最初の画面は「届くもの」── 期限の表から作られた 1 通。表と今日の日付はその下で書き換えられる。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。道具の中は帳面の法（components/kit-demo/kit-demo.module.css）。
 * COLOR: 朱は落款と、設定の切り替えで選ばれている印だけ。直すところの文も墨の濃さだけで語る。
 * TRUTH: 通知と「設定を確かめる」の文は、キットの src/ の写し（./kit/）が作る。見せかけの文を書かない。
 * このページはサーバー部品のまま。道具（DeadlineDemo）は "use client" のこの下だけに閉じる。
 */
import type { Metadata } from "next";
import Link from "next/link";

import { KitClose, KitPriceLine } from "@/components/kit-demo/KitClose";

import { fontVars } from "../fonts";
import s from "../projects.module.css";
import { DeadlineDemo } from "./DeadlineDemo";

/** 値段の一行は発売記念の最終日の翌 00:00（日本時間）に定価へ変わる。要求のたびに組む */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "期限アラート GAS キット",
  description:
    "スプレッドシートに書いた期限を、毎朝 1 通にまとめて Slack か Discord へ知らせる Apps Script のキットの見本です。表を書き換えて、届く 1 通をその場で確かめられます。",
  alternates: { canonical: "/projects/deadline" },
};

export default function DeadlinePage() {
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
          期限アラート GAS キット
          <span className={s.latin}>Deadline Alert</span>
        </h1>
        <p className={s.lede}>
          スプレッドシートに書いた期限を、毎朝 8 時に 1 通にまとめてお知らせします。期限を過ぎたものが先頭に並びます。
        </p>
      </header>

      <div className={s.work}>
        <KitPriceLine slug="deadline" />
        <DeadlineDemo />
        <KitClose
          slug="deadline"
          made="上の 1 通と「設定を確かめる」の文は、キットに入っている src/ の関数をこのページの中でそのまま動かして作っています。文面をまねて書いたものではありません。キットでは、同じ関数が毎朝 8 時にスプレッドシートを読み、Slack か Discord へ送ります。"
        />
      </div>
    </main>
  );
}
