import { categoryMetadata } from "@/components/ryoushi/category-meta";

import { SitesPage } from "./content";

export const metadata = categoryMetadata("ja", "sites");

export default function Page() {
  return <SitesPage lang="ja" />;
}
