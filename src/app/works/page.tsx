/*
 * 作品と道具の全件。トップの入口「Works」の行から来る紙。
 *
 * ここに並ぶのは、この紙の上で誰でもその場で触れるもの ── だから値段は添えない
 * （見積もり電卓はテンプレとしては売り物だが、この面では無料の道具として並ぶ。
 *  買うほうの導線は Kits の紙と、作品ページの結びにある）。
 * FORM: 料紙（分類のページ）— 文法は DESIGN.md
 */
import type { Metadata } from "next";

import { Rows, Sheet, SheetClose, SheetSection } from "@/components/ryoushi";
import { INDEX_PAGES, projectsByCategory } from "@/lib/projects";

const sheet = INDEX_PAGES.works;

export const metadata: Metadata = {
  title: sheet.title,
  description: sheet.lede,
  openGraph: {
    title: sheet.title,
    description: sheet.lede,
    url: "/works",
    images: ["/og/works.png"],
  },
  twitter: { card: "summary_large_image", images: ["/og/works.png"] },
};

export default function WorksPage() {
  return (
    <Sheet title={sheet.title} latin={sheet.latin} lede={sheet.lede}>
      <SheetSection>
        <Rows items={projectsByCategory("works")} />
      </SheetSection>
      <SheetClose />
    </Sheet>
  );
}
