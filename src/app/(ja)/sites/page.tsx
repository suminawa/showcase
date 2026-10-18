import { categoryMetadata } from "@/i18n/category-meta";

import { SitesPage } from "./content";

export const metadata = categoryMetadata("ja", "sites");

export default function Page() {
  return <SitesPage lang="ja" />;
}
