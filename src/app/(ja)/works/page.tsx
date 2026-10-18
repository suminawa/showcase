import { categoryMetadata } from "@/i18n/category-meta";

import { WorksPage } from "./content";

export const metadata = categoryMetadata("ja", "works");

export default function Page() {
  return <WorksPage lang="ja" />;
}
