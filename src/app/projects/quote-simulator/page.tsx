import { Content, metadataFor } from "./content";

export const metadata = metadataFor("ja");

export default function Page() {
  return <Content lang="ja" />;
}
