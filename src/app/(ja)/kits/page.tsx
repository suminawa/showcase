/*
 * キットの一覧（日本語）。棚と更新の記録は KitsPage.tsx。英仏の /kits は前の組み方（CategorySheet）のまま。
 */
import { categoryMetadata } from "@/components/ryoushi/category-meta";

import { KitsPage } from "./KitsPage";

/** 札の値段は記念価格の表（prices.ts）を日付で引く。切れた記念の値を出さないよう、要求のたびに組む */
export const dynamic = "force-dynamic";

export const metadata = categoryMetadata("ja", "kits");

export default function Page() {
  return <KitsPage />;
}
