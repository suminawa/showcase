import { ContactPage, contactMetadata } from "@/app/(ja)/contact/content";
import { foreignLang, type LangParams } from "@/i18n/params";

export async function generateMetadata({ params }: LangParams) {
  return contactMetadata(foreignLang((await params).lang));
}

export default async function Page({ params }: LangParams) {
  return <ContactPage lang={foreignLang((await params).lang)} />;
}
