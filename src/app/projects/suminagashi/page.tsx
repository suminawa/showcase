/*
 * THESIS: 作品そのものが体験。紙は床の間に退き、水盤を載せる台になる（Experience）。
 * OWN-WORLD: トップと同じ料紙。ただし役の配り方が違う ── ここでは紙が主役ではない。
 *   界線は頭の版面にだけ敷き、作品の版面には一本も通さない。筆脈と流れは持ち込まない
 *   （どちらも「段から段へ移る」「索引の行に触れる」ための仕掛けで、この面には段が一つしか無い）。
 * COLOR: 紙は墨の濃淡だけ。唯一の色は朱の落款ひとつで、それが戻りの導線を兼ねる。
 *   ＊ 水盤の中の藍と墨は【作品の色】であって紙の色ではない。だから料紙に寄せない ──
 *     作品自体の色は作品のものである。額装が変わっても、掛かっている絵は変わらない。
 * STORY: 開くと墨が落ち、渦がかかり、模様が開く。触ると水面が応える。
 * FIRST VIEWPORT: 頭（戻り・名乗り・一行）と、その下いっぱいの水盤。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 */
import type { Metadata } from "next";
import Link from "next/link";

import { SuminagashiBasin } from "@/components/suminagashi/SuminagashiBasin";

import { fontVars } from "../fonts";
import s from "../projects.module.css";

export const metadata: Metadata = {
  title: "墨流し — Suminagashi",
  description:
    "藍と墨が水面で渦を巻く GPU 流体の水盤。かき混ぜて、墨を落として、気に入った模様を保存できる。",
};

export default function SuminagashiPage() {
  return (
    <main className={`${s.paper} ${fontVars}`}>
      {/* 入りの一筆。紙の右上を掠めて画面外へ抜ける。水盤には一度も掛からない */}
      <div className={s.stroke} aria-hidden="true">
        <span className={`${s.ink} ${s.inkKasure}`} />
        <span className={`${s.ink} ${s.inkCore}`} />
      </div>

      <header className={s.head}>
        <Link href="/" className={s.back}>
          <span className={s.seal} aria-hidden="true">
            墨
          </span>
          Showcase へ戻る
        </Link>
        <h1 className={s.title}>
          墨流し
          <span className={s.latin}>Suminagashi</span>
        </h1>
        <p className={s.lede}>ドラッグでかき混ぜる・タップで墨を落とす</p>
      </header>

      <div className={s.work}>
        <SuminagashiBasin />
      </div>
    </main>
  );
}
