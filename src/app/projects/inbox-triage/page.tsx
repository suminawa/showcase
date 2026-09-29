/*
 * THESIS: 問い合わせが「整理されて届く」ところを、料紙の上で先に読ませる（Operate）。
 *   最初の画面は、5 通を整理した回に届く 1 通。その下で 1 通ずつ、分類・要約・下書き・シートの行を読む。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。道具の中は帳面の法（components/kit-demo/kit-demo.module.css）。
 * COLOR: 朱は落款と、選んでいるメールの印だけ。要対応も墨の字（⚠）で語る。
 * TRUTH: このページは API を一度も呼ばない。AI の答えは見本の記録（キットの SAMPLE_ANSWERS と、
 *   その形で置いた 1 通）で、画面にもそう書く。答え以外はキットの src/ の写し（./kit/）が作る。
 */
import type { Metadata } from "next";
import Link from "next/link";

import { KitClose, KitPriceLine } from "@/components/kit-demo/KitClose";

import { fontVars } from "../fonts";
import s from "../projects.module.css";
import { InboxDemo } from "./InboxDemo";

export const metadata: Metadata = {
  title: "AI 問い合わせ整理キット",
  description:
    "Gmail に届く問い合わせを AI が読み、分類・緊急度・要約をスプレッドシートに、返信案を下書きに置く Apps Script のキットの見本です。見本のメール 5 通の整理の結果を読めます。",
  alternates: { canonical: "/projects/inbox-triage" },
};

export default function InboxTriagePage() {
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
          AI 問い合わせ整理キット
          <span className={s.latin}>Inbox Triage</span>
        </h1>
        <p className={s.lede}>
          Gmail に届いた問い合わせを AI が読み、分類・緊急度・要約をスプレッドシートに、返信の下書きを Gmail に置きます。送るのは人で、自動では送りません。
        </p>
      </header>

      <div className={s.work}>
        <KitPriceLine slug="inbox-triage" />
        <InboxDemo />
        <KitClose
          slug="inbox-triage"
          made="通知の 1 通・シートの行・下書きの本文・ラベル・Claude に渡す文は、キットに入っている src/ の関数をこのページの中でそのまま動かして作っています。AI の答えだけは見本の記録で、このページから AI は呼びません。キットでは、同じ関数が 15 分ごとに Gmail を読み、ご自身の API キーで Claude に尋ねます。"
        />
      </div>
    </main>
  );
}
