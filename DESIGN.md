---
name: Showcase
description: ガラス職人のスチール框パーティション — 触ると灯る色ガラスの壁としてのポートフォリオ
colors:
  bar: "#1b1b1e"
  glass: "#f4f2ed"
  glass-bright: "#fcfbf8"
  glass-frost: "#edebe4"
  cobalt: "#1b3fb4"
  cobalt-deep: "#142e85"
  amber: "#c9860e"
  amber-bright: "#d9930f"
  amber-ink: "#332707"
  oxblood: "#8c2a2c"
  ink: "#1b1b1e"
  ink-soft: "#5c5a52"
  white: "#ffffff"
  glow-strong: "rgba(255, 255, 255, 0.55)"
  glow-on-color: "rgba(255, 255, 255, 0.28)"
typography:
  display:
    fontFamily: "Big Shoulders, Noto Sans JP, sans-serif"
    fontSize: "clamp(3rem, 7vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Noto Sans JP, sans-serif"
    fontSize: "clamp(1.5rem, 2.5vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.3
  kicker:
    fontFamily: "Big Shoulders, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    letterSpacing: "0.14em"
  subhead:
    fontFamily: "Noto Sans JP, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Noto Sans JP, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.9
  caption:
    fontFamily: "Noto Sans JP, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.9
  label:
    fontFamily: "Noto Sans JP, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.6
  amount:
    fontFamily: "Noto Sans JP, sans-serif"
    fontWeight: 700
    fontFeature: "tabular-nums"
rounded:
  none: "0px"
spacing:
  bar: "6px"
  bar-mobile: "4px"
  mullion: "12px"
  pane-pad: "clamp(20px, 3vw, 40px)"
components:
  pane:
    backgroundColor: "{colors.glass}"
    rounded: "{rounded.none}"
    padding: "{spacing.pane-pad}"
  pane-hover:
    backgroundColor: "{colors.glass-bright}"
  segment-active:
    backgroundColor: "{colors.cobalt}"
    textColor: "#ffffff"
  summary-pane:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.ink}"
---

# Design System: Showcase

## Overview

**Creative North Star: "ガラス職人のパーティション" (The Glazier's Partition)**

サイト全体が、ガラス職人の工房から出てきたスチール框（かまち）のガラス仕切り壁である。マットブラックの框がレイアウトグリッドそのものであり、その間に透明・乳白のガラスペインが嵌まる。作品・操作・出力はすべて「1 枚のペイン」として壁に嵌め込まれ、触れると背後から灯り、選ばれると色ガラス（コバルト・アンバー）に染まる。静かな地に、いま重要なものだけが色を持つ。

これは「口で説明するより、見た方が早い」の物質化である: 壁は読むものではなく歩み寄って触るもので、ガラスは触れたことに必ず光で応える。精密な框はエンジニアの工作精度を語り、装飾は存在しない — 素材（ガラスの質感・框の黒・色ガラス）がすべてを語る。

**Key Characteristics:**
- 黒い框がグリッド: gap がそのまま框。線は框だけ
- 静かなガラス地 + 要所だけ色ガラス（コバルト = 選択、アンバー = 出力/主役）
- ホバー = 背後から灯る。選択 = ペイン全面が色に染まる
- 何もスライドしない。動きは「ガラスがゆっくり明るくなる」だけ

## Colors

ほぼ無色のガラス壁に、色ガラスを「音符のように」少数配置する。

### Primary
- **Cobalt / コバルトガラス** (#1b3fb4): 選択・アクティブ状態の色。セグメント選択、チェック済みオプション、フォーカスリング、リンクの現在地。押下時は **Cobalt Deep** (#142e85)
- **Amber / アンバーガラス** (#c9860e): 「いま重要な出力」の色。ハブの Featured 作品ペイン、シミュレーターの見積もりサマリーペイン。ホバー時 **Amber Bright** (#d9930f)。アンバー上の二次テキストは **Amber Ink** (#332707、コントラスト 4.8:1) を使う — #41300a 等それより薄い茶は AA 不合格

### Secondary
- **Oxblood / オックスブラッド** (#8c2a2c): 希少な第三の色ガラス。純粋な色ペイン（テクスチャとしての色の音符）にのみ使用。UI 状態には未割当

### Neutral
- **Bar / 框の黒** (#1b1b1e): グリッドの框・テキストの ink・入力枠。線的要素はすべてこの色
- **Glass / ガラス白** (#f4f2ed): ペインの地。微細なノイズと斜めのシーン（光沢）を持つ
- **Glass Bright** (#fcfbf8): ホバーで背後から灯った状態・入力フィールドの地
- **Glass Frost** (#edebe4): 空きスロット・無効状態のすりガラス
- **Ink Soft** (#5c5a52): ガラス上の二次テキスト（グレーではなくガラスの色相に寄せた暖色）

### Named Rules
**The Bar Rule.** 線は框（黒）だけ。ペイン内部に罫線・ボーダー・ディバイダーを引かない。区切りは必ず「框を挟んだ別ペイン」か余白で表現する。
**The Flood Rule.** 色は必ずペイン全面を染める。ガラス地の上に小さな色アクセントを散らさない。
**The Two Notes Rule.** 1 画面に置く色ガラスは原則 2〜3 枚まで。色の希少性が「いま重要なもの」を語る。

## Typography

**Display Font:** Big Shoulders（variable。Latin のみ — 見出しラベル・キッカー・ワードマーク用）
**Body Font:** Noto Sans JP（本文・日本語見出し・金額）

**Character:** 鋼材に刻印されたようなコンデンスド・ゴシック（Big Shoulders）が框の世界の Latin を受け持ち、日本語は Noto Sans JP が静かに支える。金額は Noto Sans JP 700 + tabular-nums で帳票の精度を出す。

### Hierarchy
- **Display** (700, clamp(3rem, 7vw, 6rem), lh 0.95, uppercase): ワードマーク「SHOWCASE」のみ
- **Headline** (700, clamp(1.5rem, 2.5vw, 2rem), Noto Sans JP): 作品名・ページタイトル
- **Kicker** (600, 13px, tracking 0.14em, uppercase, Big Shoulders): ペインのラベル（NO.001、ESTIMATE 等）
- **Subhead** (700, 17px, lh 1.4): ページ内タイトル（帯の中の h1 等）
- **Body** (400, 16px, lh 1.9): 説明文。最大 65ch
- **Caption** (400, 15px, lh 1.9): ペイン内の補足文・タグ・キャプション
- **Amount** (700, tabular-nums): 金額。サマリー合計は clamp(2.25rem, 4vw, 3rem)

### Named Rules
**The Inside-the-Pane Rule.** テキストは必ず 1 ペインの内側に収まる。框をまたぐテキスト・框に重なる装飾は禁止。
**The One-Statement Rule.** 1 ペインに載せる声明は 1 つ（キッカー + 見出し + 補足は 1 声明とみなす）。

## Layout

グリッドの gap がそのまま框になる。コンテナ背景 = Bar 黒、`gap: 6px`（モバイル 4px）、外周 `padding: 12px`（モバイル 8px）が外框。ペイン = グリッドセル。

- ハブ: デスクトップは 12 列 × 6 行の壁一面（min-height 100svh）。左上に大きなタイトルペイン、右に最大の Featured 作品ペイン、残りをテクスチャペイン（シーデッド・リーデッド・色ノート・フロスト空きスロット）が埋める。ペインの大きさ = 重要度
- シミュレーター: 上部にバック/タイトルの帯、左に入力ペイン群（縦積み）、右にサマリーペイン（sticky）。モバイルは 1 列に積み、框の太さを 4px に保つ
- 余白リズム: ペイン内 padding はハブ `clamp(20px, 3vw, 40px)`、シミュレーター（Operate 面は密度高め）`clamp(20px, 3vw, 36px)`。見出しの上に下より広い余白

## Elevation & Depth

影は存在しない。奥行きは「光」で表す: ホバーで background-color が Glass Bright に上がり、`box-shadow: inset 0 0 90px rgba(255,255,255,0.55)` の内側グローで「背後から照らされたガラス」を作る。ドロップシャドウ・浮き上がりは禁止。

### Named Rules
**The Backlight Rule.** インタラクティブなペインの反応は常に「背後からの光」（明度上昇 + 内側グロー）。持ち上げない・浮かせない。

## Shapes

角丸 0。すべてのペイン・ボタン・入力・チップは直角。框は直線のみ。円形要素は存在しない（チェック標などの記号は例外）。

## Components

### Panes（基礎）
- **Shape:** 直角、radius 0
- **地:** Glass + ノイズテクスチャ + 対角シーン。変種: `pane-frost`（すりガラス）、`pane-reeded`（縦リブガラス）、`pane-cobalt` / `pane-amber` / `pane-oxblood`（色ガラス）
- **Hover（インタラクティブのみ）:** Glass Bright + 内側グロー、600ms cubic-bezier(0.22,1,0.36,1)
- **Focus:** `outline: 3px solid cobalt, offset -3px`（色ガラス上では白）

### Segmented Control（単価方式・工数単位）
- ミニ壁: `inline-grid`、gap 3px、背景 Bar、padding 3px
- 各オプション = 小ペイン。rest: Glass / hover: Glass Bright / `aria-checked`: Cobalt 全面 + 白文字
- キーボード: 矢印キーで移動（roving tabindex）、Home/End 対応

### Option Rows（チェックボックス）
- 行リストは SegmentedControl と同じミニ壁（コンテナ bg Bar、gap 3px、padding 3px）に嵌める。行自体にボーダーは引かない（Bar Rule）
- 行全体が 1 ペイン。未選択: Glass、選択: Cobalt 全面 + 白文字。加算率は行末に
- ネイティブ input は sr-only、行が label。`:has(:focus-visible)` で行にフォーカスリング

### Inputs / Fields
- **Style:** 2px Bar 黒枠（框）、地 Glass Bright、右寄せ tabular-nums
- **Focus:** 枠が Cobalt に

### Summary Pane（シミュレーターの出力）
- Amber 全面。内訳行（余白区切り、罫線なし）、合計は Amount 大サイズ + AnimatedYen のカウント
- デスクトップで sticky

### Navigation
- 戻りリンク = 小ペイン「← SHOWCASE」（Big Shoulders キッカー）。hover で灯る

## Do's and Don'ts

### Do:
- **Do** gap（6px / モバイル 4px）と外周 padding（12px / 8px）で框を表現する。框の太さはどのブレークポイントでも維持
- **Do** 色はペイン全面に染める（Flood Rule）。選択 = Cobalt、出力/主役 = Amber
- **Do** 動きは背景色・光のみ（600ms ease-out）。`prefers-reduced-motion` では即時反映
- **Do** テキストと数値は AA コントラストを守る（Glass 上の二次テキストは #5c5a52 以上）

### Don't:
- **Don't** 角丸・ドロップシャドウ・グラデーションテキスト・ガラスモーフィズム（backdrop-blur 装飾）を使わない
- **Don't** ペイン内に罫線を引かない（Bar Rule）。カード in カードのネストをしない
- **Don't** translate/scale で要素を動かさない（Nothing Slides — 動きは明度と色だけ）
- **Don't** 色アクセントを散らさない。1 画面の色ガラスは 2〜3 枚
