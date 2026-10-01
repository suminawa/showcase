/*
 * 行き先を省いた /go/<key> は BOOTH へ渡す。
 * 配布する zip の README には短い道（/go/s2-lite）を書いてあるので、その道を生かす。
 * 渡し先の決め方・記録・404 は /go/<key>/<dest> と同じ（そちらの GET にそのまま渡す）。
 */
import { GET as go } from "./[dest]/route";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }): Promise<Response> {
  const { key } = await params;
  return go(request, { params: Promise.resolve({ key, dest: "booth" }) });
}
