/*
 * 売っているものの全件。トップの入口「Kits」の行から来る紙。
 *
 * 発売中は定価、発売前は「発売前」とだけ小の字で添える（チップにも朱にもしない ──
 * 朱は「決めた」ことの印であって、売っていることの印ではない）。
 * 行の飛び先は作品ページで、購入の導線は作品ページの結びにある。
 * 作品ページを持たない 4 本だけ、同じ名義の note の記事へ直に飛ばす。
 * FORM: 料紙（分類のページ）— 文法は DESIGN.md
 */
import type { Metadata } from "next";

import { Rows, Sheet, SheetClose, SheetSection } from "@/components/ryoushi";
import { INDEX_PAGES, projectsByCategory } from "@/lib/projects";

const sheet = INDEX_PAGES.kits;

export const metadata: Metadata = {
  title: sheet.title,
  description: sheet.lede,
  openGraph: {
    title: sheet.title,
    description: sheet.lede,
    url: "/kits",
    images: ["/og/kits.png"],
  },
  twitter: { card: "summary_large_image", images: ["/og/kits.png"] },
};

export default function KitsPage() {
  return (
    <Sheet title={sheet.title} latin={sheet.latin} lede={sheet.lede}>
      <SheetSection>
        <Rows items={projectsByCategory("kits")} showSale />
      </SheetSection>
      <SheetClose />
    </Sheet>
  );
}
