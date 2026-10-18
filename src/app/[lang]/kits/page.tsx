import { KitsPage } from "@/app/(ja)/kits/KitsPage";
import { categoryMetadata } from "@/i18n/category-meta";
import { foreignLang, type LangParams } from "@/i18n/params";

/** 札の値段は日付で変わる（日本語の /kits と同じ）。要求のたびに組む */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams) {
  return categoryMetadata(foreignLang((await params).lang), "kits");
}

export default async function Page({ params }: LangParams) {
  return <KitsPage lang={foreignLang((await params).lang)} />;
}
