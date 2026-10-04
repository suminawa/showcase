import { pageMetadata } from "@/i18n/meta";
import { SITE_NAME } from "@/lib/site";

import { Home } from "./content";
import { copy } from "./copy";

/** いま見てほしいもの 4 点の札は日付で値段が変わる（/kits と同じ）。切れた記念の値を出さないよう、要求のたびに組む */
export const dynamic = "force-dynamic";

export const metadata = pageMetadata("ja", "/", {
  title: SITE_NAME,
  description: copy.ja.description,
  absoluteTitle: true,
});

export default function Page() {
  return <Home lang="ja" />;
}
