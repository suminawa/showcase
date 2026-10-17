---
name: suminawa.dev
description: 方眼 ── 業務自動化・AI活用・Web制作の道具を、スプレッドシートと同じマス目に並べた店
colors:
  paper: "#f6f3eb"
  cell: "#fffefa"
  cell-head: "#efebe2"
  sumi: "#1c1a15"
  sumi-2: "#3a3730"
  sumi-3: "#55514a"
  sumi-4: "#6a665d"
  grid: "#d7d4cb"
  grid-strong: "#b1ada3"
  shu: "#a63a2e"
  on-sumi: "#f6f3eb"
  on-sumi-2: "#c9c4b8"
typography:
  display:
    fontFamily: "Hiragino Mincho ProN, Yu Mincho, Noto Serif CJK JP, serif"
    fontSize: "calc(0.72 * var(--masu))"
    fontWeight: 600
    lineHeight: "var(--masu)"
    letterSpacing: "calc(0.28 * var(--masu))"
  page-title:
    fontFamily: "Hiragino Mincho ProN, Yu Mincho, Noto Serif CJK JP, serif"
    fontSize: "clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0.04em"
  headline:
    fontFamily: "Hiragino Mincho ProN, Yu Mincho, Noto Serif CJK JP, serif"
    fontSize: "clamp(1.5rem, 1.15rem + 1.2vw, 2rem)"
    fontWeight: 600
    lineHeight: 1.45
    letterSpacing: "0.04em"
  title:
    fontFamily: "Hiragino Mincho ProN, Yu Mincho, Noto Serif CJK JP, serif"
    fontSize: "clamp(1.125rem, 1.05rem + 0.3vw, 1.25rem)"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.02em"
  body:
    fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, BIZ UDPGothic, Yu Gothic UI, Meiryo, Noto Sans JP, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "0.02em"
  body-sm:
    fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, BIZ UDPGothic, Yu Gothic UI, Meiryo, Noto Sans JP, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "0.02em"
  small:
    fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, BIZ UDPGothic, Yu Gothic UI, Meiryo, Noto Sans JP, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0.02em"
  caption:
    fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, BIZ UDPGothic, Yu Gothic UI, Meiryo, Noto Sans JP, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0.04em"
  label:
    fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, BIZ UDPGothic, Yu Gothic UI, Meiryo, Noto Sans JP, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.06em"
    fontFeature: "\"tnum\" 1"
  index:
    fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, BIZ UDPGothic, Yu Gothic UI, Meiryo, Noto Sans JP, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.06em"
    fontFeature: "\"tnum\" 1"
  figure:
    fontFamily: "Hiragino Mincho ProN, Yu Mincho, Noto Serif CJK JP, serif"
    fontSize: "clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.02em"
  price-md:
    fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, BIZ UDPGothic, Yu Gothic UI, Meiryo, Noto Sans JP, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.2
    fontFeature: "\"tnum\" 1"
  price-lg:
    fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, BIZ UDPGothic, Yu Gothic UI, Meiryo, Noto Sans JP, sans-serif"
    fontSize: "clamp(1.625rem, 1.3rem + 1.2vw, 2.125rem)"
    fontWeight: 600
    lineHeight: 1.2
    fontFeature: "\"tnum\" 1"
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.7
  price:
    fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, BIZ UDPGothic, Yu Gothic UI, Meiryo, Noto Sans JP, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.4
    fontFeature: "\"tnum\" 1"
rounded:
  none: "0px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  6: "24px"
  8: "32px"
  12: "48px"
  16: "64px"
  24: "96px"
components:
  button-primary:
    backgroundColor: "{colors.sumi}"
    textColor: "{colors.on-sumi}"
    rounded: "{rounded.none}"
    height: "48px"
    padding: "0 24px"
  button-primary-hover:
    backgroundColor: "{colors.sumi-2}"
  button-secondary:
    backgroundColor: "{colors.cell}"
    textColor: "{colors.sumi}"
    rounded: "{rounded.none}"
    height: "48px"
    padding: "0 20px"
  cell:
    backgroundColor: "{colors.cell}"
    textColor: "{colors.sumi}"
    rounded: "{rounded.none}"
    padding: "20px"
  cell-head:
    backgroundColor: "{colors.cell-head}"
    textColor: "{colors.sumi-4}"
  post:
    backgroundColor: "{colors.sumi}"
    textColor: "{colors.on-sumi}"
    rounded: "{rounded.none}"
    padding: "20px 24px"
  footer:
    backgroundColor: "{colors.sumi}"
    textColor: "{colors.on-sumi}"
---

# Design System: suminawa.dev

## Overview

**Creative North Star: 「方眼」── 業務自動化・AI活用・Web制作の道具を、スプレッドシートと同じマス目に並べた店。**

買い手は、Google Workspace を使う従業員 1〜30 人の会社・事務所・教室の事務担当と経営者。毎日スプレッドシートを開いている人たちに、そのマス目の上で品物を見せる。名乗りの見出しは一字一マスで方眼に入り、品物はセルの範囲として並び、動く見本の表は同じ方眼の文法（マス目の線・列の記号・行番号・選択の枠）で置かれる。触れているもの・選んでいるものは、スプレッドシートで選んだセルと同じ朱の枠で囲む。

店は三つの柱（業務自動化・AI活用・Web制作・Webアプリ制作。`src/lib/projects.ts` の `PILLARS`）で棚を分ける。名乗りの一行は「業務自動化、AI活用、Web制作。」で、方眼の見出しは柱ごとに 1 段。トップの第一画面は見出しの下に三つの柱の 3 列（スマホは 1 列）、/kits は三つの棚、頭とフッターの案内も同じ三つ。主軸（中小企業の事務担当・看板 3 本）は業務自動化の柱の中で保ち、AI の柱は役目を決めた道具として見せる（「何でも AI で」とは書かない）。

概念の文書は `docs/redesign/2026-10-17-concept.md`（三つの柱は同じ文書の 8 節）。2026-10-17 に料紙（作品集の文法）から作り直した。

**Key Characteristics:**

- 地は紙、セルは白。境目はマス目の線（墨 12%）。影も角丸も使わない
- 見出しは明朝、本文と値段と表はゴシック。事務の書類と同じ組み合わせ
- 朱は二つにだけ使う ── 落款（名乗りの印）と、選択の枠
- PC とスマホで並べ方を変える。共通なのは色・字・朱の決まりと、8px の刻みだけ
- 見本は実物が動く。看板 3 本はキットの関数（期限・フォーム）と、キットの見本の画面そのもの（予約）

## Colors

紙と墨と朱の三色に、セルの白とマス目の線を足す。

- **紙** (#F6F3EB): 地。ページの面。BOOTH・note・Shorts の画と同じ紙で、売り場から来た人が同じ店だと分かる
- **白** (#FFFEFA): セル。表・カード・見本・帳票の地。紙の上に置いた一枚のシート
- **セルの見出し** (#EFEBE2): 列の記号・行番号の地（スプレッドシートの見出しの帯）
- **墨** (#1C1A15 15.7:1 / #3A3730 10.7:1 / #55514A 7.1:1 / #6A665D 5.2:1。紙の上): 字の濃さの四段。本文は墨 2、添えは墨 4 まで
- **マス目** (#D7D4CB): 方眼・表・カードの境目の線。飾りの線で、これだけで部品を見分けさせない（字と配置で分かる）
- **マス目の濃い線** (#B1ADA3): 表の見出しの下、記入欄の下の一本（記入欄は墨 50% の一本で 3:1 を保つ）
- **朱** (#A63A2E、紙の上 5.8:1・白の上 6.4:1・マス目の線に対して 4.3:1): 選択の枠と落款
- **墨の面** (#1C1A15 に紙の字 #F6F3EB、添え #C9C4B8 は 10.0:1): 主の押す先、届いた 1 通の写し、フッター

### Named Rules

**The Selection Rule.** 朱は「選ばれている」ことの印。触れている・Tab で来たカードと行、選んでいる設定、いまいるページ、と落款。押す先の色・値段・注意・強調には使わない。

**The Two Materials Rule.** 紙は面、白はシート。白い面には必ずマス目の線で縁を付け、紙の上に置いた一枚として見せる。白を地に広げない。

## Typography

**見出し:** 端末の明朝の 600（ヒラギノ明朝 W6 → 游明朝 Demibold → Noto Serif CJK）
**本文:** 端末のゴシック（ヒラギノ角ゴ → BIZ UDP ゴシック → 游ゴシック UI → メイリオ → Noto Sans JP）

明朝は品のある見出しに、ゴシックはスマホの小さな字でも細らない本文に。日本語の書類と同じ役の分け方。

**web の書体は読まない（2026-10-17 に実測して決めた）。** Shippori Mincho 600 を next/font で読むと、日本語の書体の @font-face（120 余りの切れ）だけで描画を止める CSS が gzip で 38KB 増え、スマホの Lighthouse の性能が 94 に落ちた。端末の明朝にすると 97〜99。Apple の端末のヒラギノ明朝 W6 は、BOOTH の 1 枚目と同じ字でもある。Android で CJK の明朝が無い端末では、見出しがゴシックの太字になる（崩れはしない）。料紙の Hina Mincho と Shippori Mincho 400/500 は、前の世界の紙（英仏のトップ・/sites・/works・案内記事）だけが読む。

### Hierarchy

- **名乗り** (600, 0.72 × マス、行送り 1 マス): 方眼の見出し一つだけ。一字一マス、字間でマスの幅に送る。6 列 × 3 段（柱ごとに 1 段）
- **ページの題** (600, 28〜44px, 1.35): /kits・品物のページ・/contact・/about の h1
- **見出し** (600, 24〜32px, 1.45): 段の題
- **品名** (600, 18〜20px, 1.5): カード・行・品物のページの題の二段目
- **本文** (400, 16px, 1.8): 最長 38 字。`line-break: strict`。カードの一行・表の中は 15px（body-sm）
- **添え** (400, 14px, 1.7): 注記・説明の一行。表の見出し・帳票の項目名・段の札は 13px（caption）
- **ラベル** (400, 12px, 等幅数字): 値段の添え（税込・買い切り）
- **索引** (400, 11px, 等幅数字): 列の記号（A・B・C）と行番号だけ。飾りなので読み上げに出さない
- **数字の大きな字** (600, 24〜36px、明朝): 「買う前に確かめられること」の 0 円・3 営業日・14 日
- **値段** (600, 17px／購入の箱では 22〜34px、等幅数字): 「¥2,980」。税込・買い切りを必ず添える
- **等幅** (13px): 見本の中の返事の JSON だけ

### Named Rules

**The Masu Rule.** 名乗りの見出しは一字一マス。全角の字は 1em なので、字間を (マス − 1em) にすれば送りがちょうど 1 マスになる。字を一字ずつ span に割らない（読み上げが一字ずつ切れる）。句読点もマスを一つ使う。改行は文節で、手で入れる。`palt` を掛けない（送りが崩れる）。英字は原稿用紙と同じ扱いで、2 字（AI）は 1 マス、3 字（Web）は 2 マスに入れる ── 語ごとに一つの inline-block（字間 0・中央ぞろえ・幅はマスの整数倍）にし、左右を半分の字間ぶんずらして前後の送りを保つ。

**The Phrase Rule.** 見出しの改行は文節で。手で入れた改行（`<br>`）か、`word-break: auto-phrase`（効く端末だけ）。一字だけの行を作らない。

## Layout

- 刻みは 8px。余白・行送り・カードの寸法・マスの寸法はすべて 8px の倍数か、マス（`--masu`）の倍数
- 器の幅は 1200px まで。左右の余白は 16px（スマホ）・24px（タブレット）・40px（PC）
- 区切り: 640px（1 列 → 2 列）、1024px（2 列 → 3 列、第一画面を左右に割る）
- 見えるマス目は四か所だけ: 名乗りの方眼、動く見本の表、カードの並び、帳票。ほかの地は紙のまま

### PC とスマホ

- **PC（1024px〜）:** トップの第一画面は、誰向けの一行 → 左に 6×3 マスの名乗り・右に二文と押す先 → 三つの柱の 3 列（柱の名と一行の帯・代表のキット 3 行・一覧／動く見本／受託の三行）。その下に期限アラートの動く見本（左に説明と ほかの柱の見本への道、右に見本）。キットは 3 列のカード。品物のページは頭の帯を左右に割り（題と一行／値段と帳票と購入）、見本はその下に全幅で
- **タブレット（640〜1023px）:** 第一画面は縦に積む（柱は 1 列）。カードは 2 列
- **スマホ（〜639px）:** 1 列。第一画面に、誰向けの一行・方眼の見出し（1 マス 60px まで）・二文・押す先が収まり、そのすぐ下に業務自動化の柱が続く（390×844 で確かめる）。一覧は写真を左に置いた行

### Named Rules

**The Empty Cell Rule.** カードの並びで最後の段が欠けるときは、空いたマスを空のセルとして描く。表が途中で切れたように見せない。空のセルは読み上げに出さない。

## Elevation & Depth

平ら。影は使わない。奥行きは面の色で言う（紙 → 白のセル → 墨の面）。重なりが要るのは選択の枠だけで、隣のセルの境目の上に 2px の朱を載せる。

## Shapes

角はすべて 0。セル・ボタン・帳票・見本の枠、どれも四角い。丸いのは予約ページの見本の中（キットの画面そのものの形）だけ。

## Components

### 選択の枠（selection）

カード・行・品物の入口に触れる、または Tab で来ると、外側に 2px の朱の枠と、右下に 7px の四角（スプレッドシートのフィルハンドル）が出る。動かさずに出す。`:focus-visible` と `:hover` で同じ形。押せるものの当たりは 44px 以上。

### セル（cell / card）

白の地、マス目の線の縁。並べるときは縁を共有する（隣り合う線が二重にならない）。中は 20〜24px の余白。カードの写真は 4:3、実画面の切り抜き（`public/kits/<slug>-{480,960}.webp`、紙の地 #F4EFE6 の上に置いた画面）。

### 行（row）

左に行番号のマス（セルの見出しの帯）、右に品名・一行・値段。行ごと押せる。看板 3 本の入口と、スマホの一覧で使う。

### 帳票（spec）

項目名（添え・墨 4）と値（本文・墨）を、マス目の線で区切った二列の表。値段・月額・置く時間・知らせる先は、どの品物でも同じ順で書く。

### 押す先（button）

- **主:** 墨の地・紙の字・高さ 48px・角 0。触れると墨 2
- **従:** 白の地・墨の字・墨の 1px の縁
- **文中のリンク:** 墨 2 の字に 1px の下線、触れると墨
- フォーカスは朱の 2px の輪（選択の枠と同じ）

### 届いた 1 通（post）

キットが作った通知の写し。墨の面に紙の字、ゴシック、行送り 1.75。アプリの真似（アイコン・吹き出し）はしない。作り直した直後だけ縁を 200ms 濃くする（reduced-motion では出さない）。

### 名乗りの方眼（masu heading）

6 列 × 3 段のマス目（業務自動化、／AI活用、／Web制作。）。マスの寸法は `min(76px, 器の幅 / 6)`（PC。スマホは 60px まで。コンテナクエリ）。字は 0.72 マス。英字は The Masu Rule のとおり、AI は 1 マス・Web は 2 マス。

### 頭とフッター

- **頭:** 紙の地・下にマス目の線一本。落款（朱の四角に「墨」）と「suminawa」、案内、PC だけ右に「相談する」（44px）。案内は PC では三つの柱（業務自動化・AI活用・Web制作 → /kits の #automation・#ai・#web）、1024px 未満では「キット」の一つ。そのあとに頼み方と料金・運営者。いまいるページの項目の下に朱の 2px（品物のページでは、その品物の柱）
- **フッター:** 墨の面。名乗りの一行（三つの柱）、キット（三つの棚と一覧）・ご相談・このサイト（運営者・悩みから読む・見本サイト・作品と道具）・ほかの場所の四つの欄、言語の切り替え。見本サイト（/demos）にも出す。頭は見本サイトでは出さない（架空の会社のページの頭を邪魔しない）

## Do's and Don'ts

### Do:

- **Do** 値段・月額・置く時間を、どの品物でも同じ順・同じ書式で書く
- **Do** 数字は出どころのあるものだけを書く（値段は `src/lib/projects.ts`、時間は手順書、返信と 14 日は決まりの文）
- **Do** 見本は実物で動かす。見せかけの画面を描かない
- **Do** 選択の枠は朱、押す先は墨。役を混ぜない
- **Do** 本文は最初から見えている状態で出す
- **Do** 画像には寸法を書き、第一画面より下は遅延読み込みにする

### Don't:

- **Don't** 影・角丸・グラデーション・ガラスの効果を使わない
- **Don't** 朱を押す先・値段・注意・強調に使わない
- **Don't** 方眼をページ全体に敷かない（四か所だけ）
- **Don't** 名乗りの方眼に `palt` を掛けない・一字ずつ span に割らない
- **Don't** 隠してから現す入場の演出、飾りの動き（にじみ・揺れ・流体）を足さない
- **Don't** 期限や人数つきの値下げの書き方（「先着」「◯月まで」）をしない
- **Don't** 内向きの呼び名や、裏づけのない数字・体験談を書かない
- **Don't** 「何でも AI で」「AI に全部」と書かない。AI の柱は、案内窓口・書類の読み取り・問い合わせの整理のように役目を決めた道具として見せる
