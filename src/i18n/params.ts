import { notFound } from "next/navigation";

import { isForeignLang, type ForeignLang } from "./routes";

/** [lang] の値を en・fr に絞る。ほかは 404 */
export function foreignLang(value: string): ForeignLang {
  if (!isForeignLang(value)) notFound();
  return value;
}

/** [lang] の下のページ・レイアウトが受け取る params */
export type LangParams = { params: Promise<{ lang: string }> };
