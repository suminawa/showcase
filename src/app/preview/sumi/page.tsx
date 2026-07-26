/*
 * プレビュー: 墨の世界（墨壺で線を打った一枚の白木の板）
 * 現行トップ（ガラス職人の框パーティション）と見比べるための一時ルート。
 * 採用が決まったら / に昇格し、このディレクトリは削除する。
 * 仕様: .superpowers/docs/specs/2026-07-26-sumi-world-spec.md
 *
 * THESIS: 線が先にあり、面は後から従う。框は〈物〉だったが墨線は〈痕跡〉。
 * OWN-WORLD: 板 #f6f3ed に墨線 #14171b。顔料は墨・藍・朱の三挺のみ。
 * FIRST VIEWPORT: 板一枚 → 墨が左から右へ走って区画が生まれる（900ms）→
 *   朱の面が 620ms 遅れて染まる。陳列窓は紙白なので最初からそこに在る。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { CategoryLabel } from "@/components/hub/CategoryLabel";
import { ProjectCard } from "@/components/hub/ProjectCard";
import { projectsByCategory } from "@/lib/projects";

const PANE_PAD = "p-[clamp(20px,3vw,40px)]";

export const metadata: Metadata = {
  title: "墨の世界（プレビュー）",
  description: "トップページの別案。墨壺で線を打った白木の板の世界",
};

export default function SumiPreview() {
  const [suminagashi] = projectsByCategory("sites");
  const [quote] = projectsByCategory("tools");

  return (
    <main className="world-sumi flex min-h-svh flex-col gap-2.5 p-2 sm:gap-3 sm:p-3">
      <header className="grid grid-cols-1 gap-1 sm:gap-1.5 lg:grid-cols-12">
        <div
          className={`pane flex flex-col justify-end ${PANE_PAD} lg:col-span-7`}
        >
          <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] font-bold tracking-[0.06em] uppercase">
            Suminawa
          </h1>
          <p className="mt-3 font-display text-[1.0625rem] tracking-[0.3em] text-ink-soft">
            墨縄
          </p>
        </div>
        <p
          className={`pane flex flex-col justify-end gap-3 ${PANE_PAD} lg:col-span-3`}
        >
          <span className="font-display text-[clamp(1.25rem,1.8vw,1.625rem)] font-semibold tracking-[0.06em] uppercase">
            Things I&apos;ve built.
          </span>
          <span className="text-[0.9375rem] leading-[1.9] text-ink-soft">
            口で説明するより、見た方が早い。
          </span>
        </p>
        <div
          aria-hidden="true"
          className="pane-reeded hidden lg:col-span-2 lg:block"
        />
      </header>

      <section
        aria-label="SITES — 動いて、触れる Web 表現"
        className="grid grid-cols-1 gap-1 sm:gap-1.5 lg:grid-cols-12"
      >
        <CategoryLabel label="SITES" className="lg:col-span-2" />
        <ProjectCard
          project={suminagashi}
          variant="marble"
          className="min-h-[42svh] lg:col-span-10 lg:min-h-[38svh]"
        />
      </section>

      <div className="flex flex-col gap-2.5 sm:gap-3 lg:flex-row">
        <section
          aria-label="TOOLS — 実務で使える道具"
          className="grid flex-1 grid-cols-1 gap-1 sm:gap-1.5 lg:grid-cols-6"
        >
          <CategoryLabel label="TOOLS" className="lg:col-span-2" />
          <ProjectCard project={quote} variant="amber" className="lg:col-span-4" />
        </section>
        <section
          aria-label="GAMES — 準備中"
          className="grid flex-1 grid-cols-1 gap-1 sm:gap-1.5 lg:grid-cols-6"
        >
          <CategoryLabel label="GAMES" className="lg:col-span-2" />
          <div
            className={`pane-frost flex flex-col justify-end gap-2 ${PANE_PAD} lg:col-span-4`}
          >
            <p className="text-[0.9375rem] leading-[1.9] text-ink-soft">
              準備中 — 最初のゲームがここに嵌まります。
            </p>
          </div>
        </section>
      </div>

      <footer className="grid grid-cols-1 gap-1 sm:gap-1.5 lg:grid-cols-12">
        <p
          className={`pane flex items-end ${PANE_PAD} text-[0.8125rem] leading-[1.9] text-ink-soft lg:col-span-8`}
        >
          すべての作品は、その場で実際に動きます。
        </p>
        <Link
          href="/"
          className={`pane pane-lit flex items-end ${PANE_PAD} font-display text-[0.8125rem] font-bold tracking-[0.14em] uppercase lg:col-span-4`}
        >
          ← ガラス案（現行トップ）と見比べる
        </Link>
      </footer>
    </main>
  );
}
