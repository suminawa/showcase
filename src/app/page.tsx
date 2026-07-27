/*
 * THESIS: 領域とは、どこを流れたかを憶えている染料の色のこと。作品は水盤の
 * 染料そのものであり、押せる場所は DOM の矩形ではなく GPU テクスチャの argmax。
 * OWN-WORLD: 紙白の一面。枠線・罫線・角丸・チップ・カードは一つも無い。
 * 構造は縦の余白のリズムだけが作る。色は藍と墨の 2 挺だけ。
 * STORY: 紙白 →（0.24〜1.6s）滴が落ちて輪が育つ → 風が羽根状に梳く → 索引の
 * 行・スウォッチ・水面が同時に光る（対提示）→ 触れば混ざり、離せば帰る。
 * FIRST VIEWPORT: 左にワードマーク・タグライン・余白の索引・動詞 3 つ、
 * 右に水盤（canvas は左列に一切かからない）。モバイルは縦に積む。
 * FORM: ink basin — 仕様 .superpowers/docs/specs/2026-07-27-ink-basin-hub-spec.md
 *
 * 框（.pane*）の世界は作品ページ 2 枚が使い続ける。当面は併存する。
 */
import { BASIN_SPECIES, BasinIndex } from "@/components/hub/BasinIndex";
import { BasinVerbs, InkBasin } from "@/components/hub/InkBasin";

export default function Home() {
  return (
    <main className="world-basin">
      <header className="basin-head">
        <h1 className="text-[clamp(1.5rem,2.2vw,2rem)] leading-[1.2] font-semibold tracking-[0.05em] text-[color:var(--sumi)]">
          Showcase
        </h1>
        <p className="mt-[clamp(10px,1.4vh,16px)] text-[1.0625rem] leading-[1.5] text-[color:var(--sumi-soft)]">
          Things I&apos;ve built.
        </p>
      </header>

      {/* 水盤。canvas は aria-hidden なので、読み上げ順は索引へ素通しになる */}
      <div className="basin-water">
        <InkBasin species={BASIN_SPECIES} />
      </div>

      <BasinIndex className="basin-index" />

      <BasinVerbs className="basin-verbs" />
    </main>
  );
}
