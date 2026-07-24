/*
 * THESIS: 見積もりという実務タスクを、同じパーティション壁の文法で操作する。
 * 表現はタスクを曇らせない（Operate）。
 * OWN-WORLD: 框グリッド + ガラスペイン。選択 = コバルト flood、出力 = アンバーの
 * サマリーペイン。線は框だけ、角丸 0、動きは灯りとカウントのみ。
 * STORY: 触るたびにガラスが染まり、右の琥珀ペインで合計が追従する。
 * 「動く・気持ちいい・実務が分かっている」を体感させる。
 * FIRST VIEWPORT: 上帯 = 戻りペイン + タイトルペイン + オックスブラッドの色ノート。
 * 左 = 入力ペイン群（縦積み）、右 = sticky なアンバーサマリー（合計が主役）。
 * FORM: glazier colorfield partition — ハブと同一世界の Operate 面。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { QuoteSimulator } from "@/components/quote-simulator/QuoteSimulator";

export const metadata: Metadata = {
  title: "見積もりシミュレーター",
  description:
    "作業条件を入力すると、見積もりの内訳と合計がリアルタイムで見える電卓",
};

export default function QuoteSimulatorPage() {
  return (
    <main className="grid min-h-svh grid-cols-1 content-start gap-1 p-2 sm:gap-1.5 sm:p-3 lg:grid-cols-12">
      <Link
        href="/"
        className="pane pane-lit flex items-center px-[clamp(20px,3vw,40px)] py-4 font-display text-[0.8125rem] font-semibold tracking-[0.14em] uppercase lg:[grid-column:1/3]"
      >
        ← Showcase
      </Link>
      <div className="pane flex flex-wrap items-baseline gap-x-5 gap-y-1 px-[clamp(20px,3vw,40px)] py-4 lg:[grid-column:3/8]">
        <h1 className="text-[1.0625rem] leading-snug font-bold">
          見積もりシミュレーター
        </h1>
        <p className="text-[0.8125rem] text-ink-soft">
          条件を入れると、その場で内訳が見えます
        </p>
      </div>
      <div aria-hidden="true" className="pane-oxblood hidden lg:block lg:[grid-column:8/13]" />

      <QuoteSimulator />
    </main>
  );
}
