/*
 * proxy の働く道（matcher）と、転送の応答の頭（Cookie・Cache-Control・Content-Language）。
 */
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { describe, expect, it } from "vitest";

import { LANG_COOKIE_OPTIONS, config, proxy } from "./proxy";

const matches = (url: string) => unstable_doesMiddlewareMatch({ config, url });

describe("proxy の matcher", () => {
  it("紙の道には働く", () => {
    for (const url of ["/", "/kits", "/projects/deadline", "/en", "/fr/projects/booking", "/contact"]) {
      expect(matches(url), url).toBe(true);
    }
  });
  it("静的なファイル・API・渡し口・見本・guides には働かない", () => {
    for (const url of [
      "/_next/static/chunks/a.js",
      "/api/concierge",
      "/go/deadline/note",
      "/dl/x",
      "/demos/clinic",
      "/guides",
      "/guides/deadline",
      "/hub/x",
      "/og/booking.png",
      "/ink/x",
      "/opengraph-image.png",
      "/robots.txt",
      "/sitemap.xml",
    ]) {
      expect(matches(url), url).toBe(false);
    }
  });
});

const req = (url: string, headers: Record<string, string> = {}) =>
  new NextRequest(new URL(url, "https://suminawa.dev"), { headers });

describe("proxy の応答", () => {
  it("?hl= は Cookie を置き、転送は貯めさせない", () => {
    const res = proxy(req("/projects/deadline?hl=fr"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://suminawa.dev/fr/projects/deadline");
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    const cookie = res.cookies.get("lang");
    expect(cookie).toMatchObject({ value: "fr", path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  });
  it("推定の転送も貯めさせない（Cookie は置かない）", () => {
    const res = proxy(req("/", { "x-vercel-ip-country": "US" }));
    expect(res.headers.get("location")).toBe("https://suminawa.dev/en");
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(res.cookies.get("lang")).toBeUndefined();
  });
  it("Cookie は本番だけ secure", () => {
    expect(LANG_COOKIE_OPTIONS.secure).toBe(process.env.NODE_ENV === "production");
  });
  it("英仏の道は Content-Language を名乗り、日本語の道は名乗らない", () => {
    expect(proxy(req("/en/kits")).headers.get("content-language")).toBe("en");
    expect(proxy(req("/fr")).headers.get("content-language")).toBe("fr");
    expect(proxy(req("/", { "x-vercel-ip-country": "JP" })).headers.get("content-language")).toBeNull();
  });
});
