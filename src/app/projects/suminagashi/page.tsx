/*
 * THESIS: 作品そのものが体験。水盤が視界を占め、UI は框に退く（Experience）。
 * OWN-WORLD: 框グリッドの中に紙白の水盤。藍と墨のインクだけが色。
 * 操作ボタンは下帯の小ペイン（ミニ壁）。
 * STORY: 開くと墨が落ち、渦がかかり、模様が開く。触ると水面が応える。
 * 「CSS/JS がすごい」を流体そのもので証明する。
 * FIRST VIEWPORT: 上帯（戻り + タイトル）、中央に水盤（最大面積）、下帯に操作。
 * FORM: glazier colorfield partition の枠 × suminagashi の水盤（SITES 作品の内界）。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { SuminagashiBasin } from "@/components/suminagashi/SuminagashiBasin";

export const metadata: Metadata = {
  title: "墨流し — Suminagashi",
  description:
    "藍と墨が水面で渦を巻く GPU 流体の水盤。かき混ぜて、墨を落として、気に入った模様を保存できる。",
};

export default function SuminagashiPage() {
  return (
    <main className="flex min-h-svh flex-col gap-1 p-2 sm:gap-1.5 sm:p-3">
      <div className="grid grid-cols-1 gap-1 sm:gap-1.5 lg:grid-cols-12">
        <Link
          href="/"
          className="pane pane-lit flex items-center px-[clamp(20px,3vw,40px)] py-4 font-display text-[0.8125rem] font-semibold tracking-[0.14em] uppercase lg:col-span-2"
        >
          ← Showcase
        </Link>
        <div className="pane flex flex-wrap items-baseline gap-x-5 gap-y-1 px-[clamp(20px,3vw,40px)] py-4 lg:col-span-10">
          <h1 className="text-[1.0625rem] leading-snug font-bold">
            墨流し
            <span className="ml-3 font-display text-[0.8125rem] font-semibold tracking-[0.14em] uppercase">
              Suminagashi
            </span>
          </h1>
          <p className="text-[0.8125rem] text-ink-soft">
            ドラッグでかき混ぜる・タップで墨を落とす
          </p>
        </div>
      </div>

      <SuminagashiBasin />
    </main>
  );
}
