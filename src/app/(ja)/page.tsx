import { pageMetadata } from "@/i18n/meta";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

import { TopPage } from "./top/TopPage";

/** 看板 3 本の値段は、記念価格の表（prices.ts）を日付で引く。切れた記念の値を出さないよう、要求のたびに組む */
export const dynamic = "force-dynamic";

export const metadata = pageMetadata("ja", "/", {
  title: `スプレッドシートで動く、買い切りの事務の道具 | ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
  absoluteTitle: true,
});

export default function Page() {
  return <TopPage />;
}
