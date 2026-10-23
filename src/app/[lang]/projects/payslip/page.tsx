import { Content, metadataFor } from "@/app/(ja)/projects/payslip/content";
import { foreignLang, type LangParams } from "@/i18n/params";

/** 値段の一行は記念価格（prices.ts）の日付で変わりうるので、要求のたびに組む（ほかのキットと同じ） */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LangParams) {
  return metadataFor(foreignLang((await params).lang));
}

export default async function Page({ params }: LangParams) {
  return <Content lang={foreignLang((await params).lang)} />;
}
