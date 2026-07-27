/*
 * THESIS: 界線と流れは、どちらも【紙】の話である。筆の話ではない。界線は紙にあらかじめ
 *   引かれた罫、流れは紙が濡れること ── だから二つは同じ素材の上で出会える。
 *   そして濡れた紙では、そこに引かれた墨が滲む。よってこの案は二つを足さない。
 *   流れは「行の背後に別の面を敷く」のをやめ、【既に在る界線に作用する】ものになった。
 *   触れると、その行のあたりの紙が湿り、湿った範囲を通る界線だけが滲んで太り、濃くなる。
 *   乾いた所の罫は元の細さのまま。湿りの縁では罫がぼやけて元へ戻る。
 *   水そのものはほとんど見えない。実測（1280×820）で、罫から離れた素の紙が沈む量は最大 Δ 9/255、
 *   版面の外の白い余白では最大 Δ 6/255 ── 一方その範囲の罫は厚み 3px → 4〜5px、墨 Δ 75 → 146 に変わる。
 *   見えるのは水ではなく罫の変化である ── 水が形を持って現れるのは罫の上だけ。
 * ROLES: 界線 ＝ 構造（静止時から在り、法1の起点の斜行を目に見せる。触れても自分からは何もしない）。
 *   流れ ＝ 出来事（触れたときだけ起きる。構造の【上】ではなく、構造【に】起きる）。
 * WHAT WAS CUT: 足し算でないことの実体は、降格した側から削った機能にある。
 *   界線から … 「触れると行の罫が版面いっぱいに墨を得る」ホバー表現を全廃。元案（hihaku-kei）
 *              の上から下へ線形（1.0/0.55/0.19/0.04）に減衰する濃い罫は、この案には無い。
 *              濃い罫が出るのは水が来た所だけで、範囲を決めるのは水である。
 *   流れから … 水の板を二枚（.flow/.flowDeep）から一枚へ。31s の「底の揺れ」を廃止し、
 *              表層の粒がゆっくり漂う一本に畳んだ。不透明度は 0.31+0.19 → 0.15 の一枚。
 *              そして素材 sumi-dense.png（3.18MB）を捨て sumi-sparse.png（0.24MB）にした
 *              ── 流れ案の売りだった「流体ソルバが計算した水面そのもの」を手放している。
 * WHY sumi-sparse: この案の水は「紙がうっすら灰を帯びる」までしか濃くならない（実測 α 最大 0.04）。
 *   水面の細部は一つも読めず、必要なのは連続した濃淡の斑だけ。加えて sumi-sparse は
 *   入りの一筆（.ink）が既に読んでいるので、この案の水は追加 0 バイトで成立する。
 * INHERITED: 界線案は飛白の法3（罫・区切り線を持たない）を宣言のうえ破る唯一の案。この案も継承する。
 *   ただし区切り線に見えたら負け ── 界線は分ける線ではなく、載せる線。大字 SUMINAWA の帯だけは
 *   罫を通さない（.mark::before の mask）。通すと罫線ノートの見出しになる、という元案の実測処置。
 * A11Y: 触れる単位は【作品の一行】。:has(.entry) で行き先のある行だけに限り、リンクの矩形ではなく
 *   行全体を触れる面にしたので、分類名（SITES / TOOLS）の側が不感帯にならない。
 *   :hover と :focus-visible に完全に同じ表現。reduced-motion では渡り終えた位置が即座に出る。
 * COLOR: 紙 #F6F3EB / 墨 #1C1A15。唯一の色は朱 #A63A2E の落款ひとつ。水は色を持たない。
 * FORM: hihaku-kei-nagare — 界線＋流れ（組み合わせ案 B・比較用）
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Hina_Mincho, Shippori_Mincho } from "next/font/google";

import s from "./hihaku-kei-nagare.module.css";

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
  title: "界線＋流れ — 濡れた紙では、罫が滲む",
  description:
    "Things I've built. — 紙に引かれた界線が構造。触れた行の紙が湿り、湿った範囲の界線だけが滲んで太る",
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

export default function HihakuKeiNagarePreview() {
  return (
    <main className={`${s.paper} ${display.variable} ${mincho.variable}`}>
      {/* 入りの一筆。紙の右上を斜めに掠めて画面外へ抜ける */}
      <div className={s.stroke} aria-hidden="true">
        <span className={`${s.ink} ${s.inkKasure}`} />
        <span className={`${s.ink} ${s.inkCore}`} />
      </div>

      {/* 筆が紙を離れる最後の掠れ。点だけになって右下で消える */}
      <div className={s.trace} aria-hidden="true" />

      {/* 界線は要素を足さずに引く。各段の ::before が、その段の版面ぶんだけ罫を敷く
          （装飾は擬似要素なので支援技術には現れず、pointer-events も持たない） */}
      <header className={s.mark}>
        <p className={s.showcase}>Showcase</p>
        <h1 className={s.wordmark}>SUMINAWA</h1>
        <p className={s.en}>{"Things I've built."}</p>
        {/* 落款。画面で色を持つのはここ一箇所だけ。寸法は界線一行ぶんの正方形に揃えた */}
        <span className={s.seal} aria-hidden="true">
          墨
        </span>
      </header>

      <ol className={s.works}>
        {WORKS.map((w) => (
          <li key={w.href} className={s.work}>
            {/*
              湿りは一枚しかない（流れ案は二枚あった）。静止時は opacity 0 で、
              紙の上には何も無い。濡れた界線のほうは .work::after が担当するので、
              ここに要素は要らない ── 罫は紙に引いてあるものであって、足す物ではない。
            */}
            <span className={s.wet} aria-hidden="true" />

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

        {/* 行き先の無い一行は水を持たない。:has(.entry) がそれを保証する */}
        <li className={s.work}>
          <span className={s.cat}>GAMES</span>
          <p className={s.empty}>準備中 — 最初のゲームがここに嵌まります。</p>
        </li>
      </ol>

      <footer className={s.close}>
        <p className={s.closeLine}>すべての作品は、その場で実際に動きます。</p>
        <Link href="/preview" className={s.back}>
          ← 一覧へ
        </Link>
      </footer>
    </main>
  );
}
