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
import { Viewer } from "@/components/demos/viewer/Viewer";
import type { Lang } from "@/i18n/routes";

import { AFTER_TOOL, DemoNote, ProjectShell, PurchaseNote, ShopLinks, projectMetadata } from "../shell";
import s from "../projects.module.css";
import { copy } from "./copy";
import f from "./floorplan.module.css";

export const metadataFor = (lang: Lang) => projectMetadata(lang, "floorplan", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell lang={lang} slug="floorplan" title={t.title} latin="Floor Plan" lede={t.lede}>
      <DemoNote lang={lang} />
      {/* 道具の中だけは自前の色と字を持つ。その根がこの一枚 */}
      <div className={f.tool}>
        <Viewer />
      </div>
      <p className={s.lede} style={AFTER_TOOL}>
        {t.how}
      </p>
      <p className={s.lede}>
        {t.kit}
        <ShopLinks lang={lang} slug="floorplan" linkKey="floorplan" />
      </p>
      <PurchaseNote lang={lang} />
    </ProjectShell>
  );
}
