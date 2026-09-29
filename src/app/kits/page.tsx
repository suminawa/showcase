/*
 * 売っているものの全件。トップの入口「Kits」の行から来る紙。
 *
 * 発売中は「いま払う値段」（発売記念の期間中は記念の値・最終日・定価。表は
 * src/lib/prices.ts）、発売前は「発売前」とだけ小の字で添える（チップにも朱にもしない ──
 * 朱は「決めた」ことの印であって、売っていることの印ではない）。
 * 行の飛び先は作品ページで、購入の導線は作品ページの結びにある。
 * 作品ページを持たない LINE 案内窓口だけ、同じ名義の note の記事へ直に飛ばす。
 * FORM: 料紙（分類のページ）— 文法は DESIGN.md
 */
import type { Metadata } from "next";

import { Rows, Sheet, SheetClose, SheetSection } from "@/components/ryoushi";
import { INDEX_PAGES, projectsByCategory } from "@/lib/projects";

const sheet = INDEX_PAGES.kits;

/**
 * 札の値段は日付で変わる（発売記念の最終日の翌 00:00 JST に定価へ）。
 * 静的に焼いたままだと切り替わらないので、5 分ごとに焼き直す。
 */
export const revalidate = 300;

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
        <Rows items={projectsByCategory("kits")} from="/kits" showSale />
      </SheetSection>
      <SheetClose />
    </Sheet>
  );
}
