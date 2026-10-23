import { llmsText } from "@/lib/llms";

/** AI 向けの案内（src/lib/llms.ts）。目録から組むので、ビルドのときに 1 度だけ書き出す */
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsText(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
