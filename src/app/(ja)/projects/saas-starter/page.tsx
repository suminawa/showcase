import { Content, metadataFor } from "./content";

// 本文の発売記念の値段は要求の時刻で決まる（src/lib/prices.ts）
export const dynamic = "force-dynamic";

export const metadata = metadataFor("ja");

export default function Page() {
  return <Content lang="ja" />;
}
