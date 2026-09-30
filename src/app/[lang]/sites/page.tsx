import { CategorySheet, categoryMetadata } from "@/components/ryoushi/CategorySheet";
import { foreignLang, type LangParams } from "@/i18n/params";

export async function generateMetadata({ params }: LangParams) {
  return categoryMetadata(foreignLang((await params).lang), "sites");
}

export default async function Page({ params }: LangParams) {
  return <CategorySheet lang={foreignLang((await params).lang)} category="sites" />;
}
