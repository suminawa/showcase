---
version: 1
slug: "src-app-projects-quote-simulator-page-tsx"
primary_target: "src/app/projects/quote-simulator/page.tsx"
related_targets: ["src/components/quote-simulator/QuoteSimulator.tsx","src/components/quote-simulator/QuoteSummary.tsx"]
---

# Surface: Quote Simulator (`/projects/quote-simulator`)

- **Mode:** Operate — 訪問者は見積もり計算というタスクを完了する。表現がタスク・状態・慣れた操作感を曇らせてはならない
- **Audience/job:** ハブから来た訪問者が実際に触って「動く・気持ちいい・実務が分かっている」を体感する。フリーランスの見積もり試算という実タスク
- **Task:** 単価方式選択 → 金額/工数入力 → オプション選択 → 税切替 → 内訳と合計をリアルタイム確認
- **Direction:** 同じパーティション壁の文法。左バイアス = 入力ペイン群（単価方式 / 金額・工数 / オプション / 消費税）、右バイアス = アンバーのサマリーペイン（sticky、合計が主役、AnimatedYen）。選択状態はコバルト flood
- **States:** セグメント/オプション行の rest・hover・checked（cobalt flood）・focus。未入力は 0 円（エラーなし）。days 選択時のみ 1 日=8h 注記
- **Memorable moment:** 選択するたびに行のガラスがコバルトに染まり、右のアンバーペインの合計がカウントで追従する
- **Constraints:** 計算ロジック（src/lib/quote.ts）は再実装しない。既存 ARIA を保ち、radiogroup に矢印キー（roving tabindex）を追加。UI は日本語
- **Unresolved:** なし
