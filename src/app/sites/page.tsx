/*
 * 見本サイトの全件。トップの入口「Sites」の行から来る紙。
 *
 * どれも架空の会社で作ったもので、業種別 LP テンプレ パックの中身でもある。
 * 行の飛び先は見本そのもの（/demos/*）で、値段はここに出さない ──
 * 売り物としての値段は Kits の紙に一箇所だけ置く。
 * FORM: 料紙（分類のページ）— 文法は DESIGN.md
 */
import type { Metadata } from "next";

import { Rows, Sheet, SheetClose, SheetSection } from "@/components/ryoushi";
import { INDEX_PAGES, projectsByCategory } from "@/lib/projects";

const sheet = INDEX_PAGES.sites;

export const metadata: Metadata = {
  title: sheet.title,
  description: sheet.lede,
  openGraph: {
    title: sheet.title,
    description: sheet.lede,
    url: "/sites",
    images: ["/og/sites.png"],
  },
  twitter: { card: "summary_large_image", images: ["/og/sites.png"] },
};

export default function SitesPage() {
  return (
    <Sheet title={sheet.title} latin={sheet.latin} lede={sheet.lede}>
      <SheetSection>
        <Rows items={projectsByCategory("sites")} />
      </SheetSection>
      <SheetClose />
    </Sheet>
  );
}
