/*
 * 見本サイトの全件。トップの入口「Sites」の行から来る紙。
 *
 * どれも架空の会社で作ったもので、業種別 LP テンプレ パックの中身でもある。
 * 行の飛び先は見本そのもの（/demos/*）で、値段はここに出さない ──
 * 売り物としての値段は Kits の紙に一箇所だけ置く。
 * FORM: 料紙（分類のページ）— 文法は DESIGN.md
 */
import { CategorySheet, categoryMetadata } from "@/components/ryoushi/CategorySheet";

export const metadata = categoryMetadata("ja", "sites");

export default function Page() {
  return <CategorySheet lang="ja" category="sites" />;
}
