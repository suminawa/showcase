/*
 * THESIS: 二案を足したのではない。役を分けた。
 *   【構造】＝ 筆脈。静止時から紙を縦に降りている一本。触れても 1px も動かない。
 *   【出来事】＝ 流れ。触れたときにだけ、その脈が通っている左の余白から水が差してくる。
 *   一度の接触で起きることは一つだけ ── 語り手は常に一人である。
 *
 * ★ 降格した側（筆脈）から削ったもの ── ここがこの案の要点
 *   元の筆脈案は「触れた作品までの上流が濃くなる」というホバー反応を持っていた。
 *   その機構を丸ごと捨てた。具体的には
 *     ・濃い層（#1C1A15 の第二の脈）の SVG レイヤーそのもの
 *     ・それを上から開く mask-position の遷移と、区間ごとの遅延
 *       （--myaku-dur / --myaku-in / --myaku-out）
 *     ・上流区間を一緒に開く :has(~ …) の兄弟結合子
 *     ・「← 一覧へ」に触れると脈が手元まで帰る規則
 *   結果、脈のレイヤーは一枚だけになり、状態を一つしか持たない。
 *   ホバー前後で getComputedStyle を全項目比較しても差分が出ない（検証済み）。
 *
 * WHY 統合ではなく分離か: 脈を濡らす（＝脈自体が変化する）統合案は、
 *   「脈は触れても変わらない構造である」という一点と両立しない。
 *   水は紙に染みるもので、乾いた墨の線に染みるものではない ── だから
 *   湿りは脈の【下】（z-index -1 / -2）を通る。脈は水面に浮かぶのではなく、
 *   水より先にそこに在った跡である。物理と役割が同じ順序を指している。
 *
 * OWN-WORLD: 垂直・曲線・ベクタの一本（脈）と、輪郭を持たない面（湿り）。
 *   線と線ではなく、線と面。だから同時に見ても二人が喋っている感じにならない。
 *   湿りの雲は等方 feTurbulence（x≒y）、脈の掠れは縦異方（x≫y）、
 *   原本の二筆は横異方（x≪y）── 三者はノイズの異方性でも交わらない。
 *
 * REST STATE: 紙・原本の二筆・淡い脈（#6A665D）だけ。湿りは存在しない（opacity 0）。
 * STORY: 作品の一行に触れると、脈が通っている左の余白から水が差してくる。
 *   1.55s かけて行まで届き、離すと 0.84s かけて薄まる。脈は最初から最後まで動かない。
 * MECHANISM: 脈 = 区間ごとの SVG（三筋・非スケールストローク・縦異方ノイズの掠れ）。
 *   湿り = sumi-wide.png を等方ノイズの雲で抜いた二枚の板。粒（background-position）と
 *   窓（mask-position）を別の速さで走らせて視差を作る＝「現れた」ではなく「流れ込んだ」。
 * A11Y: 触れる単位は作品の一行（.work:hover / .work:has(.entry:focus-visible)）。
 *   分類名の側も感じる。reduced-motion では脈は引かれずに最初から在り、
 *   湿りは流れずに「濡れ終わった状態」が出る。どちらも静止画として成立する。
 * FIRST VIEWPORT: 右上に入りの一筆、左下に SUMINAWA、左端を降りはじめる脈の頭。
 * COLOR: 原本のまま。唯一の色は朱 #A63A2E の落款ひとつ。
 * FORM: hihaku-myaku-nagare — 筆脈＋流れ（プレビュー案・比較用）
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Hina_Mincho, Shippori_Mincho } from "next/font/google";

import s from "./hihaku-myaku-nagare.module.css";

/**
 * 大の一行だけに使う明朝。日本語書体の細身のローマンで、
 * 太い墨のかたまりと並べたときに髪の毛のような線として残る。
 */
const display = Hina_Mincho({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--hi-display",
});

/** 極端に小さい補足はすべてこの明朝。小さくても骨が残る 500 を併せて持つ。 */
const mincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--hi-mincho",
});

export const metadata: Metadata = {
  title: "飛白 筆脈＋流れ — 脈は動かず、紙が濡れる",
  description:
    "Things I've built. — 静止時から在る一本の脈が紙の骨格を示し、触れたときだけ、その脈が通る余白から水が差してくる",
};

const WORKS = [
  {
    cat: "SITES",
    title: "墨流し — Suminagashi",
    desc: "藍と墨が水面で渦を巻く、GPU 流体の水盤。指でかき混ぜ、墨を落とし、気に入った模様はそのまま保存できる。",
    tags: ["WebGL2", "GLSL", "TypeScript"],
    href: "/projects/suminagashi",
  },
  {
    cat: "TOOLS",
    title: "見積もりシミュレーター",
    desc: "作業条件を入れると、見積もりの内訳と合計がその場で見える。フリーランスの「いくらでやる？」を 30 秒で形にする電卓。",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    href: "/projects/quote-simulator",
  },
];

/*
 * 脈の座標系。区間ごとに viewBox="0 0 100 100" / preserveAspectRatio="none" で、
 *   x = 0   … 紙の左端（1 列目の起点）
 *   x = 100 … 作品欄の左端（6 列目の起点）
 * に固定してある。区間の箱の実寸が違っても x は同じ物理位置を指すので、
 * 区間をまたいで一本に繋がる。境界では必ず接線を垂直にしてあり
 * （制御点の x を終点と揃える）、縦横比の違う箱をまたいでも折れて見えない。
 *
 * 三筋の d は同じ線を写したものではなく、僅かに違う道を通る。ずれは 0.35 単位
 * （1280px の紙で約 1.7px）まで。これ以上離すと三本の線に割れて見え、
 * 詰めすぎると一本の均一な罫になる。制御点のずれの符号を途中で反転させてあるので
 * 三筋は二度交差する ── 重なるところが肥、離れるところが痩と掠れになる。
 *
 * ★ 区間の境目では接線が必ず垂直になる（＝そこが横振れの頂点）。
 *   元案は頂点の直前・直後の制御点を y=80 / y=10 に置いていたので、
 *   境目の前後で 20%＋10% ぶん【真っ直ぐな縦線】が残っていた。実測すると
 *   375px で約 155px の直線になり、この案の失敗条件（罫に見える）に触れる。
 *   制御点を y=90 / y=5 まで頂点へ寄せ、直線を約 80px に詰めてある ──
 *   筆が向きを変えるときの折り返しは、本来こう短い。
 */
const STRANDS = {
  /* 名乗りの上に残った空白を、まだ迷いながら降りる頭。ここで筆は一度紙を離れる */
  head: [
    "M 23 0 C 15 20 34 38 27 60 C 21.5 78 36 90 31 100",
    "M 23.3 0 C 14.2 20 35 38 27 60 C 20 78 37 90 31.35 100",
    "M 22.7 0.6 C 16.4 20 32.4 38 27 60 C 23.6 78 34.4 90 30.6 100",
  ],
  /* 名乗りを飛び越えて紙に戻り、一気に右（6 列目）へ寄る。斜行そのもの */
  w1: [
    "M 33 0 C 36 14 44 22 52 32 C 62 44 76 52 84 64 C 89 71 91 90 91 100",
    "M 33.3 0 C 37.6 14 42 22 52.3 32 C 63.6 44 74 52 84.3 64 C 90.6 71 91.35 90 91.35 100",
    "M 32.7 0.8 C 33.4 14 46.6 22 51.7 32 C 60 44 78.6 52 83.7 64 C 87 71 90.65 90 90.65 100",
  ],
  /* 作品と作品のあいだ。いったん大きく左へ膨らんでから戻る、運筆の余韻 */
  w2: [
    "M 91 0 C 91 5 62 16 50 28 C 38 40 40 54 62 64 C 78 72 87 90 87 100",
    "M 91.35 0 C 91.35 5 59 16 50 28 C 35 40 43 54 62.3 64 C 80.6 72 87.35 90 87.35 100",
    "M 90.65 0 C 90.65 5 65 16 50 28 C 41 40 37 54 61.7 64 C 75.4 72 86.65 90 86.65 100",
  ],
  /* 三つめ。膨らみが一つ深くなり、もう左へ帰る準備に入っている */
  w3: [
    "M 87 0 C 87 6 54 18 40 30 C 26 42 32 56 56 66 C 72 72 80 91 80 100",
    "M 87.35 0 C 87.35 6 51 18 40 30 C 23 42 35 56 56.3 66 C 74.6 72 80.35 91 80.35 100",
    "M 86.65 0 C 86.65 6 57 18 40 30 C 29 42 29 56 55.7 66 C 69.4 72 79.65 91 79.65 100",
  ],
  /* 結び。1 列目へ戻りきり、閉じの一行の直前で掠れて終わる */
  tail: [
    "M 80 0 C 80 5 74 18 66 26 C 52 40 36 52 24 66 C 15 76 9 86 6 100",
    "M 80.35 0 C 80.35 5 72 18 66.3 26 C 54 40 33.4 52 24.3 66 C 12.6 76 9.3 86 6.4 99.4",
    "M 79.65 0 C 79.65 5 76 18 65.7 26 C 50 40 38.6 52 23.7 66 C 17.4 76 8.7 86 5.7 98.6",
  ],
} as const;

/*
 * 狭い紙（1023px 以下）用の第二の脈。
 *
 * ★ この案でいちばん手を入れたところ。
 *   元の筆脈案は「触れると上流が濃くなる」ことで脈に意味を持たせていたので、
 *   狭い紙で形が平らでも成立していた。この案では脈は一切動かない。
 *   つまり【形だけで筆跡に見えなければならない】。検証で「375px では帯 51px しかなく
 *   余白の罫に滑る」と指摘された点は、この案では致命傷になる。
 *
 *   ふたつの手で振れ幅を稼いだ。
 *   (1) 通り道そのものを広げた。作品欄の左余白を 9vw → clamp(42px, 12vw, 72px) に上げ、
 *       脈の帯を紙の縁の外（viewport の x=0）まで届かせた。375px で 51px → 65px。
 *   (2) 区間あたりの反転を 1 回から 2〜3 回に増やし、帯の 0〜100 を端まで使う。
 *       区間の横振れは 45〜79 単位（元は 30〜48 単位）。実寸で 29〜51px、元の約 2 倍。
 *   結果、375px でも「たわんだ糸」に見え、真っ直ぐな罫には見えない。
 *
 * 三筋のずれは 1.2 単位（境界）〜3 単位（区間の中ほど）。区間の中で開いて閉じるので、
 * 平行な三本の罫にならず、肥痩のある一本の束に見える。
 */
const STRANDS_NARROW = {
  head: [
    "M 78 0 C 73 14 39 18 34 34 C 29 52 60 58 58 74 C 56 88 38 93 36 100",
    "M 79.2 0 C 76 14 42 18 34 34 C 26 52 63 58 58 74 C 53 88 40 93 37.2 100",
    "M 76.8 0.5 C 70 14 36 18 34 34 C 32 52 57 58 58 74 C 59 88 36 93 34.8 100",
  ],
  w1: [
    "M 36 0 C 30 12 19 15 18 27 C 17 42 51 45 62 57 C 74 70 92 90 92 100",
    "M 37.2 0 C 33 12 22 15 18 27 C 14 42 54 45 62 57 C 77 70 93.2 90 93.2 100",
    "M 34.8 0 C 27 12 16 15 18 27 C 20 42 48 45 62 57 C 71 70 90.8 90 90.8 100",
  ],
  w2: [
    "M 92 0 C 92 5 66 15 52 26 C 38 37 34 54 52 66 C 66 76 78 92 78 100",
    "M 93.2 0 C 93.2 5 69 15 52 26 C 35 37 31 54 52 66 C 69 76 79.2 92 79.2 100",
    "M 90.8 0 C 90.8 5 63 15 52 26 C 41 37 37 54 52 66 C 63 76 76.8 92 76.8 100",
  ],
  w3: [
    "M 78 0 C 78 6 48 16 34 28 C 20 40 26 56 46 66 C 58 72 62 92 62 100",
    "M 79.2 0 C 79.2 6 51 16 34 28 C 17 40 23 56 46 66 C 61 72 63.2 92 63.2 100",
    "M 76.8 0 C 76.8 6 45 16 34 28 C 23 40 29 56 46 66 C 55 72 60.8 92 60.8 100",
  ],
  /* 狭い紙でも線が画面の縁に貼り付かないよう、左へ帰りきる先は x=12 で止める */
  tail: [
    "M 62 0 C 62 6 50 20 40 30 C 28 42 16 56 14 72 C 12.5 84 13 92 12 100",
    "M 63.2 0 C 63.2 6 53 20 40 30 C 25 42 13 56 14 72 C 15 84 15 92 13.4 99.4",
    "M 60.8 0 C 60.8 6 47 20 40 30 C 31 42 19 56 14 72 C 10 84 11 92 10.6 98.6",
  ],
} as const;

type ZoneKey = keyof typeof STRANDS;

/** 芯 / 添え / 乾き の三筋。太さと不透明度は CSS 側で与える */
const STRAND_CLASS = [s.strandCore, s.strandSide, s.strandDry];

/**
 * 脈の一区間。
 *
 * ★ レイヤーは【一枚だけ】である。元の案はここに淡い層と濃い層の二枚を重ね、
 *   濃い層をホバーで上から開いていた。その二枚目を削除したので、
 *   脈は状態を一つしか持たない ── 触れても変わりようがない構造になっている。
 */
function Myaku({ zone, at }: { zone: string; at: ZoneKey }) {
  const bundle = (cls: string, strands: readonly string[]) => (
    <g className={cls}>
      {strands.map((d, i) => (
        <path
          key={i}
          d={d}
          className={STRAND_CLASS[i]}
          fill="none"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  );

  return (
    <span className={`${s.myaku} ${zone}`} aria-hidden="true">
      <svg
        className={s.vein}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        {bundle(s.onWide, STRANDS[at])}
        {bundle(s.onNarrow, STRANDS_NARROW[at])}
      </svg>
    </span>
  );
}

export default function HihakuMyakuNagarePreview() {
  return (
    <main className={`${s.paper} ${display.variable} ${mincho.variable}`}>
      {/* 入りの一筆。紙の右上を斜めに掠めて画面外へ抜ける */}
      <div className={s.stroke} aria-hidden="true">
        <span className={`${s.ink} ${s.inkKasure}`} />
        <span className={`${s.ink} ${s.inkCore}`} />
      </div>

      {/* 筆が紙を離れる最後の掠れ。点だけになって右下で消える */}
      <div className={s.trace} aria-hidden="true" />

      <header className={s.mark}>
        {/* 脈の頭。名乗りの上に残った空白の行（1fr）を、そのまま器にしている */}
        <Myaku zone={s.zHead} at="head" />
        <p className={s.showcase}>Showcase</p>
        <h1 className={s.wordmark}>SUMINAWA</h1>
        <p className={s.en}>{"Things I've built."}</p>
        {/* 落款。画面で色を持つのはここ一箇所だけ */}
        <span className={s.seal} aria-hidden="true">
          墨
        </span>
      </header>

      <ol className={s.works}>
        {WORKS.map((w, i) => (
          <li key={w.href} className={s.work}>
            {/* 構造 ── 静止時から在り、触れても動かない */}
            <Myaku zone={i === 0 ? s.zW1 : s.zW2} at={i === 0 ? "w1" : "w2"} />

            {/*
              出来事 ── 触れたときにだけ起きる、ただ一つのこと。
              静止時は opacity 0 で、紙の上には何も無い。
              flow     = 差してくる水（表層。粒と雲が別の速さで走る）
              flowDeep = 底の流れ（触れているあいだ 31s 周期でゆっくり揺れる）
              どちらも脈より下（z-index -1 / -2）を通る。水は紙に染みるもので、
              乾いた墨の線に染みるものではない。
            */}
            <span className={s.flow} aria-hidden="true" />
            <span className={s.flowDeep} aria-hidden="true" />

            <span className={s.cat}>{w.cat}</span>
            <Link href={w.href} className={s.entry}>
              <span className={s.title}>{w.title}</span>
              <span className={s.desc}>{w.desc}</span>
              <span className={s.tags}>
                {w.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </span>
            </Link>
          </li>
        ))}

        {/* 準備中の段には湿りを置かない。開くものが無い行では何も起きない */}
        <li className={s.work}>
          <Myaku zone={s.zW3} at="w3" />
          <span className={s.cat}>GAMES</span>
          <p className={s.empty}>準備中 — 最初のゲームがここに嵌まります。</p>
        </li>
      </ol>

      <footer className={s.close}>
        {/* 脈の尾。作品欄と結びのあいだの間（52svh）を、左へ帰りながら埋める */}
        <Myaku zone={s.zTail} at="tail" />
        <p className={s.closeLine}>すべての作品は、その場で実際に動きます。</p>
        <Link href="/preview" className={s.back}>
          ← 一覧へ
        </Link>
      </footer>
    </main>
  );
}
