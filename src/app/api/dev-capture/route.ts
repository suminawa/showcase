/**
 * 開発専用: ブラウザで生成した墨流しの画像を public/ink/ へ書き出す。
 * 本番ビルドでは 404 を返す。画像を作り終えたらこのルートごと削除する。
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse(null, { status: 404 });
  }

  const { name, dataUrl } = (await request.json()) as {
    name?: string;
    dataUrl?: string;
  };

  if (!name || !dataUrl || !/^[a-z0-9-]+$/.test(name)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  const dir = path.join(process.cwd(), "public", "ink");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${name}.png`);
  await writeFile(file, Buffer.from(base64, "base64"));

  return NextResponse.json({ ok: true, file: `/ink/${name}.png` });
}
