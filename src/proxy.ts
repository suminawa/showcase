/*
 * 最初の言語の振り分けと、切り替え（?hl=）の記憶。判定そのものは src/i18n/detect.ts。
 * 静的なファイル・API・売り場への渡し口・見本・guides には働かせない。
 */
import { NextResponse, type NextRequest } from "next/server";

import { decideLang } from "@/i18n/detect";
import { LANG_COOKIE } from "@/i18n/routes";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const decision = decideLang({
    pathname,
    search,
    cookie: request.cookies.get(LANG_COOKIE)?.value,
    country: request.headers.get("x-vercel-ip-country"),
    acceptLanguage: request.headers.get("accept-language"),
    userAgent: request.headers.get("user-agent"),
  });
  if (!decision) return NextResponse.next();

  const res = NextResponse.redirect(new URL(decision.redirect, request.url), 307);
  if (decision.setCookie) {
    res.cookies.set(LANG_COOKIE, decision.setCookie, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  // 同じ道でも人によって行き先が違うので、転送そのものは貯めさせない
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export const config = {
  matcher: ["/((?!_next/|api/|go/|dl/|demos/|guides|hub/|og/|ink/|.*\\.[a-z0-9]+$).*)"],
};
