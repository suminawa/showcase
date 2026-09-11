/*
 * 見本: 間取りシミュレーター。2D の間取り図で壁を引っ張ると隣の部屋が伸び縮みし、
 * 置いた家具はそのまま 3D に映る。建築・不動産の案件に向けて「編集できる 3D」を
 * 触って確かめてもらう見本。
 * このページはサーバー部品のまま。three.js は Viewer の中で、この画面だけに読み込む。
 */
import type { Metadata } from "next";

import { DemoFooter } from "@/components/demos/DemoFooter";
import { Viewer } from "@/components/demos/viewer/Viewer";

import s from "./viewer-page.module.css";

export const metadata: Metadata = {
  title: { absolute: "見本 ｜ 間取りシミュレーター（3D）" },
  description:
    "間取りを描きかえ、家具を置き、3D で確かめる見本。壁を動かすと隣の部屋が伸び縮みします。",
  openGraph: {
    title: "見本 ｜ 間取りシミュレーター（3D）",
    description:
      "間取りを描きかえ、家具を置き、3D で確かめる見本。壁を動かすと隣の部屋が伸び縮みします。",
    url: "/demos/3d-viewer",
    type: "website",
    images: ["/opengraph-image.png"],
    siteName: "Showcase",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "見本 ｜ 間取りシミュレーター（3D）",
    description:
      "間取りを描きかえ、家具を置き、3D で確かめる見本。壁を動かすと隣の部屋が伸び縮みします。",
    images: ["/opengraph-image.png"],
  },
};

const POINTS = [
  {
    title: "壁を動かして間取りを変える",
    body: "分割線を引っ張ると隣の部屋が伸び縮みします。重なりも隙間も出ません。",
  },
  {
    title: "部屋を分ける・つなげる・名前を変える",
    body: "部屋を選んで縦か横に分け、要らなければつなげます。名前は一覧から選びます。",
  },
  {
    title: "家具を置く",
    body: "ベッド・ソファ・ダイニングセットなど 8 種。動かす・回す・消すができます。",
  },
  {
    title: "3D で確かめる",
    body: "階の切替、斜めと真上の視点、昼夜の明かり、外壁の色。間取り図の変更はその場で 3D に映ります。",
  },
];

const NOTES = [
  "glTF などの 3D データは読み込まず、間取りは分割の木、家具は箱の一覧という 2 つの表から手続き的に組み立てています。",
  "変更はお使いのブラウザにだけ保存します。サーバーには送りません。",
  "three.js はこの画面でだけ読み込みます。WebGL が使えない環境でも、間取り図の編集はそのまま使えます。",
];

export default function ViewerDemoPage() {
  return (
    <div className={s.page}>
      <main className={s.container}>
        <p className={s.eyebrow}>建築・不動産の見本</p>
        <h1 className={s.h1}>間取りを描きかえて、家具を置いて、3D で確かめる</h1>
        <p className={s.lead}>
          壁を引っ張ると隣の部屋が伸び縮みし、置いた家具はそのまま 3D に映ります。写真も 3D データも使わず、寸法の表だけから組み立てています。
        </p>

        <section className={s.section} aria-label="間取りシミュレーター">
          <Viewer />
        </section>

        <section className={s.section}>
          <h2 className={s.h2}>この見本でできること</h2>
          <ul className={s.points}>
            {POINTS.map((point) => (
              <li key={point.title} className={s.card}>
                <h3 className={s.cardTitle}>{point.title}</h3>
                <p className={s.cardBody}>{point.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section}>
          <h2 className={s.h2}>作り方</h2>
          <ul className={s.notes}>
            {NOTES.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>

        <div className={s.footer}>
          <DemoFooter brand="見本の建物" kind="建物" page="ページ" />
        </div>
      </main>
    </div>
  );
}
