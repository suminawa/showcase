/*
 * THESIS: 料紙の上に、商品を一つ置く（Operate）。色・素材・パーツ・刻印を選ぶと、
 *   3D の商品と価格がその場で変わる。見積もりシミュレーターと同じ構えで、紙は退き、道具だけが載る。
 * OWN-WORLD: 頭（戻り・名乗り・一行）は料紙の文法そのまま。道具の中だけは別の世界で、
 *   色も字も道具自身が持つ（--pc-*）。
 * COLOR: 紙の側で色を持つのは朱の落款ひとつだけ。
 * STORY: 選ぶたびに商品が変わり、選んだ内容は JSON・PNG・共有 URL で持ち出せる。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md
 * このページはサーバー部品のまま。three.js は Tool の中で、この画面だけに読み込む。
 */
import type { Metadata } from "next";
import Link from "next/link";

import "@suminawa/product-configurator/styles.css";

import links from "@/data/links.json";

import { fontVars } from "../fonts";
import s from "../projects.module.css";
import { Tool } from "./Tool";

export const metadata: Metadata = {
  title: "3D 商品コンフィギュレーター",
  description:
    "商品を 3D で回しながら、色・素材・パーツ・刻印・ロゴを選び、価格をその場で確かめる。商品ページに置ける道具。",
};

export default function ConfiguratorPage() {
  return (
    <main className={`${s.paper} ${fontVars}`}>
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
          3D 商品コンフィギュレーター
          <span className={s.latin}>Configurator</span>
        </h1>
        <p className={s.lede}>
          商品を回しながら色・素材・パーツ・刻印・ロゴを選ぶと、価格がその場で変わります
        </p>
      </header>

      <div className={s.work}>
        <Tool />
        <p className={s.lede} style={{ marginTop: "calc(2 * var(--rp-pitch))" }}>
          商品は glTF のモデル 1 つと JSON の設定 1 つでできています。ロゴの画像はお使いのブラウザの中だけで扱い、サーバーには送りません。
        </p>
        <p className={s.lede}>
          この 3D 商品コンフィギュレーターを自分のサイトに置ける版（発売記念 ¥9,800、10 月 9 日まで。見本のモデルと設定つき）
          {links.configurator.note && (
            <>
              {" ── "}
              <a href={links.configurator.note} className={s.textLink}>
                note
              </a>
            </>
          )}
          {links.configurator.booth && (
            <>
              {links.configurator.note ? " / " : " ── "}
              <a href={links.configurator.booth} className={s.textLink}>
                BOOTH
              </a>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
