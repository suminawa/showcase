/*
 * THESIS: ポートフォリオはガラス職人のパーティション壁。作品はガラスペインとして
 * 壁に嵌まり、歩み寄って触ると灯る。カード一覧というカテゴリ既定を拒否する。
 * OWN-WORLD: マットブラックの框（gap がそのまま框）、ノイズとシーンを持つガラス白、
 * 色ガラスは 1 画面 2〜3 枚。カテゴリ = 重い方立で区切られたベイ。
 * Big Shoulders + Noto Sans JP。角丸 0。
 * STORY: 訪問者は壁一面を見る → 藍のマーブルガラス（墨流し）に気づく → 触れると
 * 灯る → 開くと実際に動く。「見た方が早い」を体感する。
 * FIRST VIEWPORT: 顔ベイ（SHOWCASE + タグライン）→ SITES ベイ（墨流し = 最大の
 * マーブルペイン）→ TOOLS / GAMES ベイ → 下段ノート。ベイ間は太い方立。
 * FORM: glazier colorfield partition（seed db3c0da4）。カテゴリベイは
 * 「heavier mullions bound the sections」の文法の実装。
 */
import { CategoryLabel } from "@/components/hub/CategoryLabel";
import { ProjectCard } from "@/components/hub/ProjectCard";
import { projectsByCategory } from "@/lib/projects";

const PANE_PAD = "p-[clamp(20px,3vw,40px)]";

export default function Home() {
  const [suminagashi] = projectsByCategory("sites");
  const [quote] = projectsByCategory("tools");

  return (
    <main className="flex min-h-svh flex-col gap-2.5 p-2 sm:gap-3 sm:p-3">
      <header className="grid grid-cols-1 gap-1 sm:gap-1.5 lg:grid-cols-12">
        <h1
          className={`pane flex items-end ${PANE_PAD} font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95] font-bold tracking-[0.01em] uppercase lg:col-span-7`}
        >
          Showcase
        </h1>
        <p
          className={`pane flex flex-col justify-end gap-3 ${PANE_PAD} lg:col-span-3`}
        >
          <span className="font-display text-[clamp(1.25rem,1.8vw,1.625rem)] font-semibold tracking-[0.04em] uppercase">
            Things I&apos;ve built.
          </span>
          <span className="text-[0.9375rem] leading-[1.9] text-ink-soft">
            口で説明するより、見た方が早い。
          </span>
        </p>
        <div aria-hidden="true" className="pane-reeded hidden lg:col-span-2 lg:block" />
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
          <ProjectCard
            project={quote}
            variant="amber"
            className="lg:col-span-4"
          />
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
        <div
          aria-hidden="true"
          className="pane-cobalt h-8 lg:col-span-3 lg:h-auto"
        />
        <div
          aria-hidden="true"
          className="pane hidden lg:col-span-5 lg:block"
        />
        <p
          className={`pane flex items-end ${PANE_PAD} text-[0.8125rem] leading-[1.9] text-ink-soft lg:col-span-4`}
        >
          すべての作品は、その場で実際に動きます。
        </p>
      </footer>
    </main>
  );
}
