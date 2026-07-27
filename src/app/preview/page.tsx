/**
 * 世界の比較一覧。どの案も内容は完全に同一で、違うのは視覚世界だけ。
 * 採用が決まったらこの /preview 以下はすべて削除する。
 */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "世界の比較",
  description: "トップページの視覚世界の比較。内容は同一で、世界だけが違う",
};

/** 墨そのものに寄せた 5 案 */
const SUMI_WORLDS = [
  {
    slug: "hatsuboku",
    label: "潑墨",
    latin: "Hatsuboku",
    structure: "墨に沈む画面",
    note: "画面がほぼ全面の濃い墨。紙白の筋が走り、墨の薄いところに文字が置かれる。",
  },
  {
    slug: "takuhon",
    label: "拓本",
    latin: "Rubbing",
    structure: "白と黒の反転",
    note: "石碑を拓り取る。地は墨で真っ黒、文字と図が紙の白で抜ける。白が figure、墨が ground。",
  },
  {
    slug: "kansu",
    label: "巻子",
    latin: "Handscroll",
    structure: "横に流れる時間",
    note: "右から左へ繰る絵巻。縦ではなく横スクロールが主で、上下を軸木が挟む。",
  },
  {
    slug: "tanboku",
    label: "淡墨",
    latin: "Ink Gradation",
    structure: "濃度だけの階層",
    note: "色も罫線も使わず、紙・極淡・淡墨・中墨・濃墨・焦墨の 6 段階だけで構造を作る。",
  },
  {
    slug: "hihaku",
    label: "飛白",
    latin: "Dry Brush",
    structure: "かすれと余白",
    note: "紙が 8 割。決定的な数筆と長い沈黙。朱の落款が画面に一つだけ。",
  },
];

const WORLDS = [
  {
    slug: "tokonoma",
    label: "床の間",
    latin: "Tokonoma",
    structure: "余白（間）",
    note: "漆喰の壁と一本の松。画面の半分以上が何も無い。挿し色は菖蒲の青ひとつ。",
  },
  {
    slug: "sumitsuke",
    label: "墨付けの板図",
    latin: "Sumitsuke",
    structure: "寸法線と番付",
    note: "白木に原寸で打った墨。線は必ず寸法か基準か番付を意味する。要所に朱の印。",
  },
  {
    slug: "aoyaki",
    label: "青焼き",
    latin: "Cyanotype",
    structure: "暗い地に白線",
    note: "プルシアンブルーの感光紙に白い線。図面枠と表題欄が画面の構造になる。",
  },
  {
    slug: "katsuji",
    label: "活版の組版",
    latin: "Letterpress",
    structure: "込め物という物体",
    note: "鉄の枠に鉛と木を締め込む。余白は「無」ではなく木のブロックとして実在する。",
  },
  {
    slug: "yacho",
    label: "測量野帳",
    latin: "Field Book",
    structure: "方眼",
    note: "現場の記録の様式。要素は必ず方眼のマスに乗り、数値と番号が意味を持つ。",
  },
  {
    slug: "hyogu",
    label: "表具",
    latin: "Scroll Mounting",
    structure: "比例",
    note: "天地・中回し・一文字が厳密な比で本紙を囲む。作品を見せる構造そのものが意匠。",
  },
];

/** 飛白（かすれと余白）に線を足した派生 5 案。先頭は対照群の原本 */
const HIHAKU_LINES = [
  {
    slug: "hihaku",
    label: "飛白",
    latin: "Dry Brush",
    line: "なし（原本）",
    note: "入りの一筆と結びの掠れの二筆だけで、作品の行には線を足していない。",
  },
  {
    slug: "hihaku-hashiri",
    label: "走り",
    latin: "Third Stroke",
    line: "水平・触れると出る",
    note: "原本と同じ二層の掠れを題の足元に複製し、clip-path を左から右へ 620ms で開く。",
  },
  {
    slug: "hihaku-nawa",
    label: "墨縄",
    latin: "Chalk Line",
    line: "水平・全幅・触れると出る",
    note: "粒状マスクを左端から 118ms で開き、紙の左端から右端まで 2px の水平直線を打つ。",
  },
  {
    slug: "hihaku-myaku",
    label: "筆脈",
    latin: "Vein",
    line: "垂直・静止時から在る",
    note: "縦に蛇行する一本の脈を段ごとに分け、触れた作品までの上流を mask で上から濃くする。",
  },
  {
    slug: "hihaku-nagare",
    label: "流れ",
    latin: "Flow",
    line: "面・触れると出る",
    note: "等方ノイズでマスクした墨の面を行の背後に重ね、粒と窓を異なる距離で動かす。",
  },
  {
    slug: "hihaku-kei",
    label: "界線",
    latin: "Ruled Paper",
    line: "横罫・静止時から在る",
    note: "微かに波打つ横罫を全段に repeat-y で敷き、触れた作品の題の一本だけを濃くする。",
  },
];

/** 飛白の線を二つ以上組み合わせた 4 案 */
const HIHAKU_COMBOS = [
  {
    slug: "hihaku-myaku-nagare",
    label: "筆脈＋流れ",
    latin: "Vein + Flow",
    touch: "その行の紙が濡れる",
    note: "静止時から在る縦の脈が構造、水が出来事。脈が通る左の余白から水が 1550ms かけて差し、離すと 840ms で薄まる。脈は 1px も動かない。",
  },
  {
    slug: "hihaku-kei-nagare",
    label: "界線＋流れ",
    latin: "Ruled + Flow",
    touch: "濡れた範囲の罫が滲む",
    note: "水は自分の面を持たず、既に引かれた横罫に作用する。湿った範囲を通る罫だけが厚み 3px から 4〜5px に太り、墨が Δ75 から Δ146 になる。",
  },
  {
    slug: "hihaku-myaku-kei",
    label: "筆脈＋界線",
    latin: "Vein + Ruled",
    touch: "その行の界線が墨を得る",
    note: "縦の脈を版面の左を限る匡郭として横罫と一組にし、格子を避けるため二本を交わらせていない。匡郭は静止したまま、触れた一行の罫だけが濃くなる。",
  },
  {
    slug: "hihaku-mitsu",
    label: "三つ",
    latin: "All Three",
    touch: "紙が濡れ、その罫が濃くなる",
    note: "界線が料紙の地、筆脈がその上を降りる道筋で、二つとも静止。触れて動くのは水だけで、水の届いた範囲の界線が墨を倍にする。",
  },
];

export default function PreviewIndex() {
  return (
    <main className="mx-auto min-h-svh max-w-3xl bg-white px-6 py-16 text-neutral-900">
      <h1 className="text-2xl font-bold tracking-tight">
        トップページの世界 — 20 案
      </h1>
      <p className="mt-3 text-[0.9375rem] leading-[1.9] text-neutral-600">
        どの案も
        <strong className="font-semibold text-neutral-900">
          内容は完全に同じ
        </strong>
        です。ワードマーク、作品 2
        件、空カテゴリ、すべて同一の文字が入っています。
        違うのは視覚世界だけなので、そのまま見比べられます。
      </p>

      <h2 className="mt-12 text-[0.8125rem] font-semibold tracking-[0.14em] text-neutral-500 uppercase">
        墨に寄せた 5 案
      </h2>
      <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
        {SUMI_WORLDS.map((w) => (
          <li key={w.slug}>
            <Link
              href={`/preview/${w.slug}`}
              className="group flex flex-col gap-1.5 py-5 transition-colors hover:bg-neutral-50"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[1.0625rem] font-bold group-hover:underline">
                  {w.label}
                </span>
                <span className="text-[0.8125rem] tracking-[0.12em] text-neutral-400 uppercase">
                  {w.latin}
                </span>
                <span className="ml-auto text-[0.8125rem] text-neutral-500">
                  構造 = {w.structure}
                </span>
              </div>
              <p className="text-[0.875rem] leading-[1.8] text-neutral-600">
                {w.note}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-[0.8125rem] font-semibold tracking-[0.14em] text-neutral-500 uppercase">
        はじめの 6 案（印つけの文化圏から）
      </h2>
      <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
        {WORLDS.map((w) => (
          <li key={w.slug}>
            <Link
              href={`/preview/${w.slug}`}
              className="group flex flex-col gap-1.5 py-5 transition-colors hover:bg-neutral-50"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[1.0625rem] font-bold group-hover:underline">
                  {w.label}
                </span>
                <span className="text-[0.8125rem] tracking-[0.12em] text-neutral-400 uppercase">
                  {w.latin}
                </span>
                <span className="ml-auto text-[0.8125rem] text-neutral-500">
                  構造 = {w.structure}
                </span>
              </div>
              <p className="text-[0.875rem] leading-[1.8] text-neutral-600">
                {w.note}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-[0.8125rem] font-semibold tracking-[0.14em] text-neutral-500 uppercase">
        飛白 ── 墨の線を足す 5 案 ＋ 原本
      </h2>
      <p className="mt-2 text-[0.8125rem] leading-[1.9] text-neutral-500">
        6 件とも
        飛白（かすれと余白）の派生で、違うのは線だけです。先頭が線なしの原本なので、
        「線を足すべきか、足すならどれか」をこの列の中で見比べられます。
      </p>
      <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
        {HIHAKU_LINES.map((w) => (
          <li key={w.slug}>
            <Link
              href={`/preview/${w.slug}`}
              className="group flex flex-col gap-1.5 py-5 transition-colors hover:bg-neutral-50"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[1.0625rem] font-bold group-hover:underline">
                  {w.label}
                </span>
                <span className="text-[0.8125rem] tracking-[0.12em] text-neutral-400 uppercase">
                  {w.latin}
                </span>
                <span className="ml-auto text-[0.8125rem] text-neutral-500">
                  線 = {w.line}
                </span>
              </div>
              <p className="text-[0.875rem] leading-[1.8] text-neutral-600">
                {w.note}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-[0.8125rem] font-semibold tracking-[0.14em] text-neutral-500 uppercase">
        飛白 ── 線を組み合わせる 4 案
      </h2>
      <p className="mt-2 text-[0.8125rem] leading-[1.9] text-neutral-500">
        4 件とも
        一つ上の列にある線を二つ以上重ねた案です。どれも一方を静止した構造に固定し、
        もう一方だけを触れたときの出来事に残してあるので、
        触れて起きることは組み合わせても一つです。
      </p>
      <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
        {HIHAKU_COMBOS.map((w) => (
          <li key={w.slug}>
            <Link
              href={`/preview/${w.slug}`}
              className="group flex flex-col gap-1.5 py-5 transition-colors hover:bg-neutral-50"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[1.0625rem] font-bold group-hover:underline">
                  {w.label}
                </span>
                <span className="text-[0.8125rem] tracking-[0.12em] text-neutral-400 uppercase">
                  {w.latin}
                </span>
                <span className="ml-auto text-[0.8125rem] text-neutral-500">
                  触れると = {w.touch}
                </span>
              </div>
              <p className="text-[0.875rem] leading-[1.8] text-neutral-600">
                {w.note}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-[0.8125rem] leading-[1.9] text-neutral-500">
        気に入ったものが決まったら教えてください。採用案を仕上げて `/`
        に昇格させ、この比較用ページは削除します。
        どれも違う場合は、どこがどう違うかを言ってもらえれば別の候補を出します。
      </p>
      <p className="mt-6 text-[0.8125rem]">
        <Link href="/" className="underline underline-offset-4">
          現在のトップ（水盤案）を見る
        </Link>
      </p>
    </main>
  );
}
