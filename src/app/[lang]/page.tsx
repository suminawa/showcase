import { TopPage } from "@/app/(ja)/top/TopPage";
import { copy } from "@/app/(ja)/copy";
import { pageMetadata } from "@/i18n/meta";
import { SITE_NAME } from "@/lib/site";
import { foreignLang, type LangParams } from "@/i18n/params";

/** 札は日付で値段が変わる（日本語のトップと同じ）。要求のたびに組む */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams) {
  const lang = foreignLang((await params).lang);
  return pageMetadata(lang, "/", { title: SITE_NAME, description: copy[lang].description, absoluteTitle: true });
}

export default async function Page({ params }: LangParams) {
  return <TopPage lang={foreignLang((await params).lang)} />;
}
