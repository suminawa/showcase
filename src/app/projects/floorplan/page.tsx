/*
 * THESIS: 住まいを決める手前の検討を、料紙の上の【図面】として扱う（Operate）。
 *   見積もりシミュレーターと同じ構えで、紙は床の間に退き、道具だけが載る。
 *   持ち込まないのは料紙の法のうち「紙が八割」「動くのは一つ」の二つ ──
 *   ここは触って確かめるための面で、触るたびに 3D も間取り図も動く。
 * OWN-WORLD: 頭（戻り・名乗り・一行）は料紙の文法そのまま。
 *   道具の中だけは別の世界で、色も字も道具自身が持つ（--d-*）──
 *   額装が変わっても、掛かっている図面は変わらない。水盤と同じ理屈。
 * COLOR: 紙の側で色を持つのは朱の落款ひとつだけ。道具の中の藍鼠は道具の色で、
 *   料紙には寄せない。
 * STORY: マス目を塗ると部屋になり、置いた家具がそのまま 3D に映る。
 * FIRST VIEWPORT: 頭（戻り・名乗り・一行）、その下に 3D と間取り図。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 * このページはサーバー部品のまま。three.js は Viewer の中で、この画面だけに読み込む。
 */
import type { Metadata } from "next";
import Link from "next/link";

import { Viewer } from "@/components/demos/viewer/Viewer";
import links from "@/data/links.json";

import { fontVars } from "../fonts";
import s from "../projects.module.css";
import f from "./floorplan.module.css";

export const metadata: Metadata = {
  title: "間取りシミュレーター",
  description:
    "間取りを描きかえ、家具を置き、3D で確かめる。マス目を塗るだけで廊下も L 字も描ける、住まいの検討用の道具。",
};

export default function FloorplanPage() {
  return (
    <main className={`${s.paper} ${fontVars}`}>
      {/* 入りの一筆。紙の右上を掠めて画面外へ抜ける。図面には一度も掛からない */}
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
          間取りシミュレーター
          <span className={s.latin}>Floor Plan</span>
        </h1>
        <p className={s.lede}>
          マス目を塗って間取りを描き、置いた家具はそのまま 3D に映ります
        </p>
      </header>

      <div className={s.work}>
        {/* 道具の中だけは自前の色と字を持つ。その根がこの一枚 */}
        <div className={f.tool}>
          <Viewer />
        </div>
        <p className={s.lede} style={{ marginTop: "calc(2 * var(--rp-pitch))" }}>
          3D のデータは読み込まず、間取りはマス目の表、家具は箱の一覧という 2
          つの表から組み立てています。変更はお使いのブラウザにだけ保存し、サーバーには送りません。
        </p>
        <p className={s.lede}>
          この間取りシミュレーターを自分のサイトに置ける版（発売記念 ¥8,800、9 月 19 日まで。建具・収納・寸法・家具の実寸つき）
          {links.floorplan.note && (
            <>
              {" ── "}
              <a href={links.floorplan.note} className={s.textLink}>note</a>
            </>
          )}
          {links.floorplan.booth && (
            <>
              {links.floorplan.note ? " / " : " ── "}
              <a href={links.floorplan.booth} className={s.textLink}>BOOTH</a>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
