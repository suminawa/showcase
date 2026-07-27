/*
 * THESIS: 飛白の主役は紙である ── ここまでは原本と同じ。この案が足すのは【筆脈】、
 *   書で字と字の間、筆が紙から離れていても墨の意図だけが続いている見えない繋がりのこと。
 *   原本の「起点の斜行」（名乗り 1 列目 → 作品 6 列目 → 結び 1 列目）は今まで
 *   余白の量でしか表せていなかった。その進行を、紙を縦に降りる一本の脈がなぞる。
 * OWN-WORLD: 他の線の案が全て水平の掠れであるのに対し、これだけが【垂直・曲線・
 *   ベクタ】である。ビットマップの墨ではなく SVG の path で描き、一本を三筋
 *   （太い芯・細い添え・破線の乾き）に割って肥痩を作る。均一なベジェは墨に見えないので、
 *   三筋はそれぞれ僅かに違う制御点を持ち、収束するところが肥、離れるところが痩になる。
 * REST STATE: 【静止時から在る】。誰も触れていない紙にも淡い脈（#6A665D）が既に走る。
 *   これは罫ではない ── 真っ直ぐでなく、太さが一定でなく、feTurbulence の
 *   縦異方ノイズ（baseFrequency x≫y。原本の二筆が x≪y なのの裏返し）を mask にして
 *   長さ方向に途切れており、始点と終点は紙の中で掠れて消える。
 * STORY: ある作品に触れると、紙の上端からその作品までの区間【だけ】が墨を得る（#1C1A15）。
 *   下流は淡いまま。読み手がどこまで来たかが墨の濃さで分かる。塗りは必ず上から下へ、
 *   区間ごとに遅延を積んで 470 / 710 / 900ms かけて降りる ── 打撃でも筆速でもなく【辿る】時間。
 *   離すと逆に、下流から順に墨が退く。
 * MECHANISM: 脈は 5 区間に割ってあり、各区間は自分が属する段（名乗りの空白 /
 *   各作品＋その上の間 / 結びの間）の実寸に貼り付く。だからビューポート高が変わっても
 *   「作品 k の位置」がずれない。区間ごとに淡い層と濃い層を重ね、濃い層は
 *   箱の 2.2 倍の高さを持つグラデーション mask を mask-position で降ろして開く
 *   （切り口ではなく滲みの先端が降りる）。:has() の兄弟結合子で上流区間も一緒に開く。
 * FIRST VIEWPORT: 右上に入りの一筆、左下に SUMINAWA、そして左端を降りはじめる脈の頭。
 * COLOR: 原本のまま。唯一の色は朱 #A63A2E の落款ひとつ。脈は墨の濃淡だけで語る。
 * FORM: hihaku-myaku — 筆脈（プレビュー案・比較用）
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Hina_Mincho, Shippori_Mincho } from "next/font/google";

import s from "./hihaku-myaku.module.css";

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
  title: "飛白 筆脈 — 紙を縦に降りる脈",
  description:
    "Things I've built. — 乾いた筆が紙を掠め、白が残る。段と段のあいだを、一本の淡い筆脈が縦に繋ぐ",
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
 */
const STRANDS = {
  /* 名乗りの上に残った空白を、まだ迷いながら降りる頭。ここで筆は一度紙を離れる */
  head: [
    "M 23 0 C 18 22 28 40 26 62 C 24.5 80 32 90 31 100",
    "M 23.3 0 C 17.75 22 28.3 40 26.3 62 C 24.25 80 32.3 90 31.35 100",
    "M 22.7 0.6 C 18.3 22 27.7 40 25.7 62 C 24.8 80 31.7 90 30.6 100",
  ],
  /* 名乗りを飛び越えて紙に戻り、一気に右（6 列目）へ寄る。斜行そのもの */
  w1: [
    "M 33 0 C 36 14 44 22 52 32 C 62 44 76 52 84 64 C 89 71 91 80 91 100",
    "M 33.3 0 C 36.3 14 43.7 22 52.3 32 C 62.3 44 75.7 52 84.3 64 C 89.3 71 91.35 80 91.35 100",
    "M 32.7 0.8 C 35.7 14 44.3 22 51.7 32 C 61.7 44 76.3 52 83.7 64 C 88.7 71 90.65 80 90.65 100",
  ],
  /* 作品と作品のあいだ。いったん左へ膨らんでから戻る、運筆の余韻 */
  w2: [
    "M 91 0 C 91 10 84 16 79 24 C 74 32 74 44 79 54 C 84 64 87 72 87 100",
    "M 91.35 0 C 91.35 10 83.7 16 79.3 24 C 74.3 32 73.7 44 79.3 54 C 84.3 64 87.35 72 87.35 100",
    "M 90.65 0 C 90.65 10 84.3 16 78.7 24 C 73.7 32 74.3 44 78.7 54 C 83.7 64 86.65 72 86.65 100",
  ],
  /* 三つめ。膨らみが一つ深くなり、もう左へ帰る準備に入っている */
  w3: [
    "M 87 0 C 87 12 78 20 73 30 C 68 40 69 52 74 62 C 78 70 80 78 80 100",
    "M 87.35 0 C 87.35 12 77.7 20 73.3 30 C 68.3 40 68.7 52 74.3 62 C 78.3 70 80.35 78 80.35 100",
    "M 86.65 0 C 86.65 12 78.3 20 72.7 30 C 67.7 40 69.3 52 73.7 62 C 77.7 70 79.65 78 79.65 100",
  ],
  /* 結び。1 列目へ戻りきり、閉じの一行の直前で掠れて終わる */
  tail: [
    "M 80 0 C 80 10 74 18 66 26 C 52 40 36 52 24 66 C 15 76 9 86 6 100",
    "M 80.35 0 C 80.35 10 73.7 18 66.3 26 C 52.3 40 35.7 52 24.3 66 C 15.3 76 9.3 86 6.4 99.4",
    "M 79.65 0 C 79.65 10 74.3 18 65.7 26 C 51.7 40 36.3 52 23.7 66 C 14.7 76 8.7 86 5.7 98.6",
  ],
} as const;

/*
 * 狭い紙（1023px 以下）用の第二の脈。
 *
 * 通り道の幅は広い紙で約 480px あるが、狭い紙では作品欄の起点が
 * padding-left: 9vw に化けるため 50px 前後しか無い。同じ d を流し込むと、
 * 500px の高さに対して横の振れが 6px しか出ず ── 罫にしか見えなくなる。
 * この案の失敗条件そのものなので、狭い紙には振れを 4〜5 倍に取った別の d を渡す。
 * 筋のずれも 0.35 → 1.6 単位へ広げてある（狭い箱では 0.35 単位が 0.2px にしかならない）。
 * 物語の順序（左→右→左）と区間境界での垂直な接線は広い紙とまったく同じ。
 */
const STRANDS_NARROW = {
  head: [
    "M 62 0 C 60 18 36 26 32 44 C 28 62 44 76 46 100",
    "M 63.6 0 C 60.5 18 37.6 26 33.6 44 C 26.4 62 45.6 76 47.5 100",
    "M 60.4 0.5 C 59.5 18 34.4 26 30.4 44 C 29.6 62 42.4 76 44.5 100",
  ],
  w1: [
    "M 36 0 C 42 16 58 24 70 36 C 80 48 84 62 84 78 C 84 88 84 94 84 100",
    "M 37.6 0 C 43.6 16 57 24 71.6 36 C 81.6 48 85.6 62 85.6 78 C 85.6 88 85.6 94 85.6 100",
    "M 34.4 0.6 C 40.4 16 59 24 68.4 36 C 78.4 48 82.4 62 82.4 78 C 82.4 88 82.4 94 82.4 100",
  ],
  w2: [
    "M 84 0 C 84 10 60 16 46 28 C 32 40 32 56 50 68 C 66 78 74 84 74 100",
    "M 85.6 0 C 85.6 10 61.6 16 47.6 28 C 33.6 40 30.4 56 51.6 68 C 67.6 78 75.6 84 75.6 100",
    "M 82.4 0 C 82.4 10 58.4 16 44.4 28 C 30.4 40 33.6 56 48.4 68 C 64.4 78 72.4 84 72.4 100",
  ],
  w3: [
    "M 74 0 C 74 10 44 18 32 30 C 20 42 24 56 42 66 C 52 72 56 80 56 100",
    "M 75.6 0 C 75.6 10 45.6 18 33.6 30 C 18.4 42 25.6 56 43.6 66 C 53.6 72 57.6 80 57.6 100",
    "M 72.4 0 C 72.4 10 42.4 18 30.4 30 C 21.6 42 22.4 56 40.4 66 C 50.4 72 54.4 80 54.4 100",
  ],
  /* 狭い紙では紙の縁まで 20px しかない。左へ帰りきる先は x=17 で止め、
     線が画面の端に貼り付かないようにする */
  tail: [
    "M 56 0 C 56 10 46 20 40 30 C 31 42 22 56 19 72 C 17 84 17 92 17 100",
    "M 57.6 0 C 57.6 10 47.6 20 41.6 30 C 32.6 42 23.6 56 20.6 72 C 18.6 84 18.6 92 18.4 99.4",
    "M 54.4 0 C 54.4 10 44.4 20 38.4 30 C 29.4 42 20.4 56 17.4 72 C 15.4 84 15.4 92 15.6 98.6",
  ],
} as const;

type ZoneKey = keyof typeof STRANDS;

/** 芯 / 添え / 乾き の三筋。太さと不透明度は CSS 側で淡い層・濃い層それぞれに与える */
const STRAND_CLASS = [s.strandCore, s.strandSide, s.strandDry];

/**
 * 脈の一区間。淡い層（常在）と濃い層（上から滲み降りる）を同じ d で重ねる。
 * かすれの mask は外側の箱に一度だけ掛けるので、二層は必ず同じ場所で途切れる ──
 * 濃くなっても掠れの位置が動かない＝同じ筆であることが保証される。
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

  const layer = (cls: string) => (
    <svg
      className={`${s.vein} ${cls}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      focusable="false"
    >
      {bundle(s.onWide, STRANDS[at])}
      {bundle(s.onNarrow, STRANDS_NARROW[at])}
    </svg>
  );

  return (
    <span className={`${s.myaku} ${zone}`} aria-hidden="true">
      {layer(s.dry)}
      {layer(s.wet)}
    </span>
  );
}

export default function HihakuMyakuPreview() {
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
            <Myaku zone={i === 0 ? s.zW1 : s.zW2} at={i === 0 ? "w1" : "w2"} />
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
