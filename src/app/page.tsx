/*
 * THESIS: ポートフォリオはガラス職人のパーティション壁。作品はガラスペインとして
 * 壁に嵌まり、歩み寄って触ると灯る。カード一覧というカテゴリ既定を拒否する。
 * OWN-WORLD: マットブラックの框（gap がそのまま框）、ノイズとシーンを持つガラス白、
 * コバルト/アンバーの色ガラスは 1 画面 2〜3 枚。Big Shoulders + Noto Sans JP。角丸 0。
 * STORY: 訪問者は壁一面を見る → アンバーに染まった最大ペイン（NO.001）に気づく →
 * 触れると灯る → 開くと実際に動く道具がある。「見た方が早い」を体感する。
 * FIRST VIEWPORT: 12 列 × 6 行の壁。左上 SHOWCASE、右に最大の Featured ペイン
 * （primary action）、下段にタグライン・空きスロット・色ノート・キャプション。
 * FORM: glazier colorfield partition（challenger、seed db3c0da4）。
 * ユーザーが指名案 vitrine より選択。
 */
import { ProjectCard } from "@/components/hub/ProjectCard";
import { projects } from "@/lib/projects";

const PANE_PAD = "p-[clamp(20px,3vw,40px)]";

export default function Home() {
  const [featured] = projects;

  return (
    <main className="grid min-h-svh grid-cols-1 gap-1 p-2 sm:gap-1.5 sm:p-3 lg:grid-cols-12 lg:grid-rows-6">
      <header className="contents">
        <h1
          className={`pane flex items-end ${PANE_PAD} font-display text-[clamp(3rem,7vw,6rem)] leading-[0.95] font-bold tracking-[0.01em] uppercase lg:[grid-area:1/1/3/7]`}
        >
          Showcase
        </h1>
        <p
          className={`pane flex flex-col justify-end gap-3 ${PANE_PAD} lg:[grid-area:3/1/5/5]`}
        >
          <span className="font-display text-[clamp(1.25rem,1.8vw,1.625rem)] font-semibold tracking-[0.04em] uppercase">
            Things I&apos;ve built.
          </span>
          <span className="text-[0.9375rem] leading-[1.9] text-ink-soft">
            口で説明するより、見た方が早い。
          </span>
        </p>
      </header>

      <div
        aria-hidden="true"
        className="pane-reeded hidden lg:block lg:[grid-area:3/5/5/7]"
      />

      <section aria-label="作品一覧" className="contents">
        <ProjectCard
          project={featured}
          number="NO.001"
          className="min-h-[45svh] lg:min-h-0 lg:[grid-area:1/7/5/13]"
        />
        <div
          className={`pane-frost flex flex-col justify-end gap-2 ${PANE_PAD} lg:[grid-area:5/3/7/7]`}
        >
          <p className="font-display text-[0.8125rem] font-semibold tracking-[0.14em] text-ink-soft uppercase">
            NO.002
          </p>
          <p className="text-[0.9375rem] leading-[1.9] text-ink-soft">
            準備中 — 次の作品がここに嵌まります。
          </p>
        </div>
      </section>

      <div
        aria-hidden="true"
        className="pane-cobalt h-8 lg:h-auto lg:[grid-area:5/1/7/3]"
      />
      <div
        aria-hidden="true"
        className="pane hidden lg:block lg:[grid-area:5/7/7/9]"
      />
      <div
        aria-hidden="true"
        className="pane-oxblood hidden lg:block lg:[grid-area:5/9/7/10]"
      />

      <footer
        className={`pane flex items-end ${PANE_PAD} lg:[grid-area:5/10/7/13]`}
      >
        <p className="text-[0.8125rem] leading-[1.9] text-ink-soft">
          すべての作品は、その場で実際に動きます。
        </p>
      </footer>
    </main>
  );
}
