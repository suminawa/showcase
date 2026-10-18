import { WorksPage } from "@/app/(ja)/works/content";
import { categoryMetadata } from "@/components/ryoushi/category-meta";
import { foreignLang, type LangParams } from "@/i18n/params";

export async function generateMetadata({ params }: LangParams) {
  return categoryMetadata(foreignLang((await params).lang), "works");
}

export default async function Page({ params }: LangParams) {
  return <WorksPage lang={foreignLang((await params).lang)} />;
}
