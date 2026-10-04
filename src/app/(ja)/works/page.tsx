/*
 * 作品と道具の全件。トップの入口「Works」の行から来る紙。
 *
 * ここに並ぶのは、この紙の上で誰でもその場で触れるもの ── だから値段は添えない
 * （見積もり電卓はテンプレとしては売り物だが、この面では無料の道具として並ぶ。
 *  買うほうの導線は Kits の紙と、作品ページの結びにある）。
 * FORM: 料紙（分類のページ）— 文法は DESIGN.md
 */
import { CategorySheet, categoryMetadata } from "@/components/ryoushi/CategorySheet";

export const metadata = categoryMetadata("ja", "works");

export default function Page() {
  return <CategorySheet lang="ja" category="works" />;
}
