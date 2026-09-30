import { Content, metadataFor } from "@/app/projects/ai-concierge/content";
import { foreignLang, type LangParams } from "@/i18n/params";

export async function generateMetadata({ params }: LangParams) {
  return metadataFor(foreignLang((await params).lang));
}

export default async function Page({ params }: LangParams) {
  return <Content lang={foreignLang((await params).lang)} />;
}
