import { Content, metadataFor } from "@/app/(ja)/projects/deadline/content";
import { foreignLang, type LangParams } from "@/i18n/params";

/** 値段の一行は発売記念の最終日の翌 00:00（日本時間）に定価へ変わる。要求のたびに組む */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams) {
  return metadataFor(foreignLang((await params).lang));
}

export default async function Page({ params }: LangParams) {
  return <Content lang={foreignLang((await params).lang)} />;
}
