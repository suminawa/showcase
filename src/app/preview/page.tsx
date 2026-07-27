/**
 * 世界の比較一覧。6 案とも内容は完全に同一で、違うのは視覚世界だけ。
 * 採用が決まったらこの /preview 以下はすべて削除する。
 */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "世界の比較",
  description: "トップページの視覚世界 6 案。内容は同一で、世界だけが違う",
};

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

export default function PreviewIndex() {
  return (
    <main className="mx-auto min-h-svh max-w-3xl bg-white px-6 py-16 text-neutral-900">
      <h1 className="text-2xl font-bold tracking-tight">
        トップページの世界 — 6 案
      </h1>
      <p className="mt-3 text-[0.9375rem] leading-[1.9] text-neutral-600">
        6 案とも
        <strong className="font-semibold text-neutral-900">
          内容は完全に同じ
        </strong>
        です。ワードマーク、タグライン、作品 2 件、空カテゴリ、すべて同一の文字が入っています。
        違うのは視覚世界だけなので、そのまま見比べられます。
      </p>

      <ul className="mt-10 divide-y divide-neutral-200 border-y border-neutral-200">
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
