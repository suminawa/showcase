import { Content, metadataFor } from "./content";

/** 値段の一行は発売記念の最終日の翌 00:00（日本時間）に定価へ変わる。要求のたびに組む */
export const dynamic = "force-dynamic";

export const metadata = metadataFor("ja");

export default function Page() {
  return <Content lang="ja" />;
}
