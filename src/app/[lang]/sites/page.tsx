import { SitesPage } from "@/app/(ja)/sites/content";
import { categoryMetadata } from "@/components/ryoushi/category-meta";
import { foreignLang, type LangParams } from "@/i18n/params";

export async function generateMetadata({ params }: LangParams) {
  return categoryMetadata(foreignLang((await params).lang), "sites");
}

export default async function Page({ params }: LangParams) {
  return <SitesPage lang={foreignLang((await params).lang)} />;
}
