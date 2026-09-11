/*
 * 見本: 建物ビューア。2 階建ての家を寸法の表から組み立て、ブラウザで回して見せる。
 * 建築・不動産の案件に向けて「3D を作って動かせる」ことを、触って確かめてもらう見本。
 * このページはサーバー部品のまま。three.js は Viewer の中で、この画面だけに読み込む。
 */
import type { Metadata } from "next";

import { DemoFooter } from "@/components/demos/DemoFooter";
import { Viewer } from "@/components/demos/viewer/Viewer";

import s from "./viewer-page.module.css";

export const metadata: Metadata = {
  title: { absolute: "見本 ｜ 3D ビューア（建物）" },
  description:
    "2 階建ての家をブラウザで回して見る見本。階の切替、間取り、昼夜の照明、外壁の色を切り替えられます。",
  openGraph: {
    title: "見本 ｜ 3D ビューア（建物）",
    description:
      "2 階建ての家をブラウザで回して見る見本。階の切替、間取り、昼夜の照明、外壁の色を切り替えられます。",
    url: "/demos/3d-viewer",
    type: "website",
    images: ["/opengraph-image.png"],
    siteName: "Showcase",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "見本 ｜ 3D ビューア（建物）",
    description:
      "2 階建ての家をブラウザで回して見る見本。階の切替、間取り、昼夜の照明、外壁の色を切り替えられます。",
    images: ["/opengraph-image.png"],
  },
};

const POINTS = [
  {
    title: "階を切り替える",
    body: "1F・2F・全体。1 つの階だけ見るときは外壁を腰の高さで切り、中をのぞけるようにしています。",
  },
  {
    title: "間取りで見る",
    body: "真上からの視点に切り替え、上の階を外した断面を出します。部屋名と広さは 3D と同じ表から引いています。",
  },
  {
    title: "昼と夜",
    body: "光の色と強さを入れ替えます。夜は窓から室内の明かりが漏れます。",
  },
  {
    title: "外壁の色",
    body: "白い塗り壁・黒い板張り・杉の下見板の 3 種。色を変えても間取りの読みやすさは変えません。",
  },
];

const NOTES = [
  "glTF などの 3D データは読み込まず、寸法の表（部屋・壁・窓・屋根）から手続き的に組み立てています。",
  "three.js はこの画面でだけ読み込みます。ほかのページの表示は重くなりません。",
  "WebGL が使えない環境では、同じ表から起こした平面図に切り替えます。",
];

export default function ViewerDemoPage() {
  return (
    <div className={s.page}>
      <main className={s.container}>
        <p className={s.eyebrow}>建築・不動産の見本</p>
        <h1 className={s.h1}>2 階建ての家を、ブラウザで回して見る</h1>
        <p className={s.lead}>
          間取りの確認から外壁の色選びまで、その場で試せます。写真も 3D データも使わず、寸法の表だけから組み立てています。
        </p>

        <section className={s.section} aria-label="建物ビューア">
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
