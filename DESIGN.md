---
name: Showcase
description: 二つの世界 — トップは界線を敷いた料紙、作品ページはガラス職人のスチール框パーティション
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
  marble-ground: "#0c1424"
  marble-ground-lit: "#14213c"
  marble-ring: "#2f4f8f"
  paper: "#f6f3ed"
  indigo-ink: "#224372"
  carbon-ink: "#131719"
  ink: "#1b1b1e"
  ink-soft: "#5c5a52"
  ryoushi-paper: "#f6f3eb"
  sumi: "#1c1a15"
  sumi-2: "#3a3730"
  sumi-3: "#55514a"
  sumi-4: "#6a665d"
  shu: "#a63a2e"
  aozumi: "#8ba0c2"
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
    fontWeight: 700
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

壁は読むものではなく歩み寄って触るもので、ガラスは触れたことに必ず光で応える。精密な框はエンジニアの工作精度を語り、装飾は存在しない — 素材（ガラスの質感・框の黒・色ガラス）がすべてを語る。

**Key Characteristics:**

- 黒い框がグリッド: gap がそのまま框。線は框だけ
- 静かなガラス地 + 要所だけ色ガラス（コバルト = 選択、アンバー = 出力/主役）
- ホバー = 背後から灯る。選択 = ペイン全面が色に染まる
- 何もスライドしない。動きは「ガラスがゆっくり明るくなる」だけ

## 二つの世界

このサイトは二つの視覚世界を持つ。混ぜない。

| 面                       | 世界                                                  | 実装                                              |
| ------------------------ | ----------------------------------------------------- | ------------------------------------------------- |
| トップ `/`               | **料紙** — 界線を敷いた紙に脈が降り、触れた行が濡れる | `src/app/page.module.css`（CSS Modules で閉じる） |
| 作品ページ `/projects/*` | **框** — ガラス職人のスチール框パーティション         | `globals.css` の `.pane*`                         |

以下 Colors 以降は **框の世界**（作品ページ）の規則。料紙の世界は次章にまとめる。

## 料紙の世界（トップページ）

**Creative North Star: 「三つ」— 料紙に脈、触れて流れ**

写経の料紙に界線が引かれている。そこへ筆脈が一本、紙を縦に降りる。作品の一行に触れると、その行の紙が濡れ、水が届いた範囲の界線だけが墨を吸って濃くなる。

### 役は三つ。重ならない

| 役                   | 何が担うか | ホバーで       |
| -------------------- | ---------- | -------------- |
| **紙**（最下層）     | 界線       | 変わらない     |
| **構造**（中層）     | 筆脈       | 変わらない     |
| **出来事**（最上層） | 流れ（水） | これだけが動く |

**一度の接触で走る出来事は一つ。** 静止の罫（`.work::before`）にホバー規則は一つも無い。触れて現れる濃い罫（`.work::after`）は、形も位置も時間も水のマスクが決める ── 罫はホバーの主語ではなく目的語である。筆脈も同じで、触れても 1px も動かない。

### 構造をつくる規則

1. **起点の斜行** ── 名乗り 1 列目 / 作品 6 列目 / 結び 1 列目。界線の左端が段ごとに右へ階段を上ることで、この斜行が初めて目に見える。
2. **字の断絶** ── 「大」(28〜140px) と「小」(13〜15px) の二段だけ。20〜30px の中間帯を一箇所も使わない。落款だけは図像なのでこの外。
3. **沈黙の段差** ── 段と段の間は 40〜52svh。
4. **墨は二筆** ── 入りの一筆と、筆が紙を離れる最後の掠れ。三筆目は足さない（脈は筆の軌跡、水は筆ではない）。

### 色

- **紙** `#F6F3EB` / **墨** `#1C1A15` `#3A3730` `#55514A` `#6A665D`
- **朱** `#A63A2E` ── 落款ひとつ。**画面で色を持つのはここだけ**
- **青墨** ── 水にだけ乗る藍。`sepia(1) hue-rotate(178deg) saturate(1)` で作る。合成後に青が出る条件は `−11(1−a) + (ink_B − ink_R)·a > 0` で、実効不透明度 a > 0.17 が要る。**濃い芯だけが青く、薄い裾は灰のまま** ── 濃い墨は色を見せ、薄めた墨は灰に見えるという、実際の墨と同じ挙動。
- `#8E8A80` は図版専用。**文字色に使わない**（紙の上で 3.1:1）。

### 破ってはいけない数値

- **紙が八割。** 画面の八割以上を何も無い紙のまま残す。判定は紙より `Δ≥2/255` 暗い画素を墨として数える最厳の閾値。実測で幅 6 種 × 背丈 2 種 × 状態 3 種の全条件が 81% 以上（最悪 1440×568 のホバー）。
- **`--hi-wet-y` は `--hi-kei-pitch` の整数倍。** 半端にすると濡れた罫の位相が静止の罫からずれ、一本が二本に割れて見える。
- **板の高さは画面の高さで刻む。** 同じ 2 行でも 900px の窓では画面の 15%、568px では 24% を占める。幅をいくら締めてもこの比は動かない。背丈で三段（3 行 / 2 行 / 1 行）、狭くて背が低い窓だけ 0 行。
- **濃さと範囲は交換できる。** 濃度を上げても張り出しを締めれば紙はむしろ増える。広く薄く撒くより、狭く濃いほうが「濡れた」と読める。

### 作品を足すとき

触るのは `src/lib/projects.ts` だけ。段はレジストリから組まれ、脈の区間の横送りは `src/lib/vein.ts` の `veinPlan()` が計算するので、`d` を書き足す必要はない（`vein.test.ts` が繋ぎ目の連続性を固定している）。

## Colors

ほぼ無色のガラス壁に、色ガラスを「音符のように」少数配置する。

### Primary

- **Cobalt / コバルトガラス** (#1b3fb4): 選択・アクティブ状態の色。セグメント選択、チェック済みオプション、フォーカスリング、リンクの現在地。押下時は **Cobalt Deep** (#142e85)
- **Amber / アンバーガラス** (#c9860e): 「いま重要な出力」の色。ハブの Featured 作品ペイン、シミュレーターの見積もりサマリーペイン。ホバー時 **Amber Bright** (#d9930f)。アンバー上の二次テキストは **Amber Ink** (#332707、コントラスト 4.8:1) を使う — #41300a 等それより薄い茶は AA 不合格

### Secondary

- **Oxblood / オックスブラッド** (#8c2a2c): 希少な第三の色ガラス。純粋な色ペイン（テクスチャとしての色の音符）にのみ使用。UI 状態には未割当
- **Marble / 藍のマーブルガラス** (地 #0c1424 / 輪 #2f4f8f): SITES カテゴリの作品ペイン。乱数のシミではなく、作品そのものと同じ同心円を描いた窓（`pane-marble`）。上の白系テキストは #f4f2ed / 二次テキスト #c6d0ea

### Ink（作品「墨流し」の水盤内だけで使う色。框の内側に嵌まる）

- **Paper / 紙白** (#f6f3ed): 水盤の地（料紙の世界の紙 #F6F3EB とは別物。混同しない）
- **Indigo / 藍** (#224372) と **Carbon / 墨** (#131719): 2 種のインク。実装は「紙白 − 累積吸収」の減法混色で、この 2 色は結果として現れる値

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
- **Kicker** (600, 13px, tracking 0.14em, uppercase, Big Shoulders): ペインのラベル（SITES、ESTIMATE 等）
- **Subhead** (700, 17px, lh 1.4): ページ内タイトル（帯の中の h1 等）
- **Body** (400, 16px, lh 1.9): 説明文。最大 65ch
- **Caption** (400, 15px, lh 1.9): ペイン内の補足文・タグ・キャプション
- **Amount** (700, tabular-nums): 金額。サマリー合計は clamp(2.25rem, 4vw, 3rem)

### Named Rules

**The Inside-the-Pane Rule.** テキストは必ず 1 ペインの内側に収まる。框をまたぐテキスト・框に重なる装飾は禁止。
**The One-Statement Rule.** 1 ペインに載せる声明は 1 つ（キッカー + 見出し + 補足は 1 声明とみなす）。

## Layout

グリッドの gap がそのまま框になる。コンテナ背景 = Bar 黒、`gap: 6px`（モバイル 4px）、外周 `padding: 12px`（モバイル 8px）が外框。ペイン = グリッドセル。

- ハブ: カテゴリ = **ベイ（区画）**。ベイ内は通常框（6px / モバイル 4px）、ベイ同士はより太い方立（モバイル 10px / デスクトップ 12px = `gap-2.5 sm:gap-3`）で区切る。上から 顔ベイ（SHOWCASE + タグライン）→ SITES → TOOLS・GAMES → 下段ノート。各ベイは「ラベル小ペイン + 作品ペイン」。作品ペインの大きさ = 重要度で、最新カテゴリ（SITES）が最大
- 通し番号（NO.001 等）は使わない。ペインのキッカーはカテゴリラベル（SITES / TOOLS / GAMES）
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

### Basin（墨流しの水盤 — 作品の内界）

- 框の中に紙白の水盤。**水盤の内部だけは「動かない」原則の例外**（作品自体が動きだから）。框・角丸 0・影なしのルールは水盤の外側で従来どおり
- 操作ボタンは下帯のミニ壁（bg Bar、gap 3px、padding 3px の小ペイン列）
- WebGL2 非対応時はフロストペインで正直に伝える（偽の代替表現は出さない）

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
