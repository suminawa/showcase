/*
 * 分類のページの紙。トップと同じ料紙だが、役の配り方が違う。
 *
 *   トップ         紙が主役。名乗りと入口と 4 点が、斜めに置かれた段に載る
 *   分類のページ   一覧が主役。紙は床の間に退き、頭（戻り・題・一行）だけを持つ
 *
 * だからここには筆脈も名乗りも持ち込まない ── どちらも「段から段へ移る」
 * ための仕掛けで、この面には段が一つ（多くて二つ）しか無いからである。
 * 戻りの導線が朱の落款を連れているので、画面で色を持つのはやはり一箇所だけ。
 */
import Link from "next/link";

import s from "@/app/ryoushi.module.css";

import { REVEAL_FLAG, fontVars } from "./fonts";

export function Sheet({
  title,
  latin,
  lede,
  children,
}: {
  /** 面の題（日本語） */
  title: string;
  /** 題に添える英字。トップの入口 3 行と同じ字を置く */
  latin: string;
  /** 一行。その面に並ぶものが何なのかを、一件ずつの説明に書かずにここで一度だけ言う */
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <main className={`${s.paper} ${s.sheet} ${fontVars}`}>
      {/* 現れる演出の印。本文より先に走るので、隠す規則は最初の描画から効く */}
      <script dangerouslySetInnerHTML={{ __html: REVEAL_FLAG }} />

      {/* 入りの一筆。紙の右上を斜めに掠めて画面外へ抜ける */}
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
        <h1 className={s.pageTitle}>
          {title}
          <span className={s.latin}>{latin}</span>
        </h1>
        <p className={s.lede}>{lede}</p>
      </header>

      {children}
    </main>
  );
}

/**
 * 段。界線の版面はこの箱に一枚だけ敷かれ、上下へ 3 行ずつ張り出す ──
 * だから段と段のあいだは罫 6 本が下限になる（CSS の --hi-void がその値）。
 */
export function SheetSection({
  name,
  children,
}: {
  /** 段の名。一つしか段が無い面では省く（題がその役を兼ねる） */
  name?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={s.shelf}>
      {name && (
        <div className={s.shelfHead}>
          <h2 className={s.shelfName}>{name}</h2>
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * 一覧の紙を閉じる一行。四つの面で同じものを使う。
 *
 * 飛び先を二つ置く ── 相談へ進む道と、入口へ帰る道。
 * 一覧は長い紙（/kits は 1280px の窓で 2,500px）なので、下まで読んだ人が
 * 頭まで巻き戻さずに入口へ戻れる一行が要る。戻りの落款は頭に一つだけで、
 * ここには捺さない（画面で朱を持つのは一箇所、という決まりを守る）。
 */
export function SheetClose() {
  return (
    <footer className={s.close}>
      <p className={s.closeLine}>ご用途に合わせた制作もお引き受けします。</p>
      <p className={s.closeLinks}>
        <Link href="/contact" className={s.contact}>
          料金の目安と進め方
        </Link>
        <Link href="/" className={s.contact}>
          Showcase へ戻る
        </Link>
      </p>
    </footer>
  );
}
