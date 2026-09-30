import { Content, metadataFor } from "@/app/projects/sheet-app/content";
import { foreignLang, type LangParams } from "@/i18n/params";

// 本文の発売記念の値段は要求の時刻で決まる（src/lib/prices.ts）
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams) {
  return metadataFor(foreignLang((await params).lang));
}

export default async function Page({ params }: LangParams) {
  return <Content lang={foreignLang((await params).lang)} />;
}
