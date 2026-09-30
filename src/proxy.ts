/*
 * 最初の言語の振り分けと、切り替え（?hl=）の記憶。判定そのものは src/i18n/detect.ts。
 * 静的なファイル・API・売り場への渡し口・見本・guides には働かせない。
 */
import { NextResponse, type NextRequest } from "next/server";

import { decideLang } from "@/i18n/detect";
import { LANG_COOKIE, splitLang } from "@/i18n/routes";

/** 切り替えで置く Cookie。本番（https）だけ secure にする（手元の http でも試せるように） */
export const LANG_COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
} as const;

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
  if (!decision) {
    const res = NextResponse.next();
    // 英仏の道は、その言語の紙だと応答の頭でも名乗る（根の <html lang> は ja のまま始まるため）
    const { lang } = splitLang(pathname);
    if (lang !== "ja") res.headers.set("Content-Language", lang);
    return res;
  }

  const res = NextResponse.redirect(new URL(decision.redirect, request.url), 307);
  if (decision.setCookie) {
    res.cookies.set(LANG_COOKIE, decision.setCookie, LANG_COOKIE_OPTIONS);
  }
  // 同じ道でも人によって行き先が違うので、転送そのものは貯めさせない
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

// matcher は Next が字のまま読むので、変数を挟まず直に書く（テストは config.matcher を読む）
export const config = {
  matcher: ["/((?!_next/|api/|go/|dl/|demos/|guides|hub/|og/|ink/|.*\\.[a-z0-9]+$).*)"],
};
