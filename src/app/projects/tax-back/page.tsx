/*
 * THESIS: 見積もりシミュレーターと同じ帳面の法で、税込の切りのいい額から
 *   請求書に書く税抜と消費税を出す（Operate）。動くものは数字だけ。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 */
import type { Metadata } from "next";
import Link from "next/link";

import { TaxBack } from "@/components/tax-back/TaxBack";

import { fontVars } from "../fonts";
import s from "../projects.module.css";

export const metadata: Metadata = {
  title: "税込からの逆算",
  description: "切りのいい税込価格を決めたあと、請求書に書く税抜と消費税を出す電卓",
};

export default function TaxBackPage() {
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
          税込からの逆算
          <span className={s.latin}>Tax</span>
        </h1>
        <p className={s.lede}>切りのいい税込の額から、請求書に書く税抜と消費税を出します</p>
      </header>

      <div className={s.work}>
        <TaxBack />
      </div>
    </main>
  );
}
