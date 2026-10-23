import { Content, metadataFor } from "./content";

/** 値段の一行は記念価格（prices.ts）の日付で変わりうるので、要求のたびに組む（ほかのキットと同じ） */
export const dynamic = "force-dynamic";

export const metadata = metadataFor("ja");

export default function Page() {
  return <Content lang="ja" />;
}
