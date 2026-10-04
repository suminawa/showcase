import { serializeJsonLd } from "@/lib/jsonld";

/** 構造化データの <script>。中身は src/lib/jsonld.ts で組む */
export function JsonLd({ data }: { data: Parameters<typeof serializeJsonLd>[0] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
