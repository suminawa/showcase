import { categoryMetadata } from "@/components/ryoushi/category-meta";

import { WorksPage } from "./content";

export const metadata = categoryMetadata("ja", "works");

export default function Page() {
  return <WorksPage lang="ja" />;
}
