/*
 * 売っているものの全件。トップの入口「Kits」の行から来る紙。
 *
 * 発売中は「いま払う値段」（発売記念の期間中は記念の値・最終日・定価。表は
 * src/lib/prices.ts）、発売前は「発売前」とだけ小の字で添える（チップにも朱にもしない ──
 * 朱は「決めた」ことの印であって、売っていることの印ではない）。
 * 行の飛び先は作品ページで、購入の導線は作品ページの結びにある。
 * 2026-10-04 から、すべての行が作品ページを持つ（売り場への道は作品ページの結び）。
 * FORM: 料紙（分類のページ）— 文法は DESIGN.md
 */
import { CategorySheet, categoryMetadata } from "@/components/ryoushi/CategorySheet";

/**
 * 札の値段は日付で変わる（発売記念の最終日の翌 00:00 JST に定価へ）。
 * 焼き直しの間隔を置くと、切れた記念の値を数分のあいだ出してしまうので、要求のたびに組む。
 */
export const dynamic = "force-dynamic";

export const metadata = categoryMetadata("ja", "kits");

export default function Page() {
  return <CategorySheet lang="ja" category="kits" />;
}
