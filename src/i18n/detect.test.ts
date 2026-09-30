import { describe, expect, it } from "vitest";

import { decideLang, guessLang, isBot, noteLang } from "./detect";

const CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36";
const GOOGLEBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

describe("guessLang", () => {
  it("国が JP なら日本語、ほかは英語", () => {
    expect(guessLang("JP", "en-US,en")).toBe("ja");
    expect(guessLang("US", "ja,en")).toBe("en");
    expect(guessLang("DE", null)).toBe("en");
  });
  it("日本の外で Accept-Language の先頭が fr なら仏語", () => {
    expect(guessLang("FR", "fr-FR,fr;q=0.9,en;q=0.8")).toBe("fr");
    expect(guessLang("CA", "en;q=0.5,fr-CA")).toBe("fr");
    expect(guessLang("FR", "en-GB,fr;q=0.7")).toBe("en");
  });
  it("国が分からなければ Accept-Language だけで決め、何も無ければ日本語", () => {
    expect(guessLang(null, "ja-JP,ja;q=0.9")).toBe("ja");
    expect(guessLang(null, "fr")).toBe("fr");
    expect(guessLang(null, "de-DE,de")).toBe("en");
    expect(guessLang(null, null)).toBe("ja");
    expect(guessLang(undefined, "")).toBe("ja");
  });
});

describe("isBot", () => {
  it("検索エンジンとプレビューの UA を見分ける", () => {
    expect(isBot(GOOGLEBOT)).toBe(true);
    expect(isBot("Mozilla/5.0 (compatible; bingbot/2.0)")).toBe(true);
    expect(isBot("facebookexternalhit/1.1")).toBe(true);
    expect(isBot("Mozilla/5.0 (compatible; Google-InspectionTool/1.0;)")).toBe(true);
    expect(isBot("GoogleOther")).toBe(true);
    expect(isBot("WhatsApp/2.23.20.0 A")).toBe(true);
    expect(isBot("Iframely/1.3.1 (+https://iframely.com/docs/about)")).toBe(true);
    expect(isBot(CHROME)).toBe(false);
    expect(isBot(null)).toBe(false);
  });
});

describe("decideLang", () => {
  const base = { search: "", userAgent: CHROME };

  it("海外から日本語の道へ来た人を英語の道へ（クエリは残す）", () => {
    expect(decideLang({ ...base, pathname: "/", country: "US" })).toEqual({ redirect: "/en" });
    expect(decideLang({ ...base, pathname: "/projects/dashboard", search: "?lang=en", country: "GB" })).toEqual({
      redirect: "/en/projects/dashboard?lang=en",
    });
    expect(decideLang({ ...base, pathname: "/kits", country: "FR", acceptLanguage: "fr-FR" })).toEqual({
      redirect: "/fr/kits",
    });
  });

  it("日本から来た人・ボットには何もしない", () => {
    expect(decideLang({ ...base, pathname: "/", country: "JP" })).toBeNull();
    expect(decideLang({ ...base, pathname: "/", country: "US", userAgent: GOOGLEBOT })).toBeNull();
  });

  it("Cookie は推定より強い", () => {
    expect(decideLang({ ...base, pathname: "/works", country: "US", cookie: "ja" })).toBeNull();
    expect(decideLang({ ...base, pathname: "/works", country: "JP", cookie: "fr" })).toEqual({ redirect: "/fr/works" });
    // 知らない値の Cookie は無いものとして扱う
    expect(decideLang({ ...base, pathname: "/works", country: "JP", cookie: "de" })).toBeNull();
  });

  it("英仏の道はそのまま出す（Cookie が日本語でも）", () => {
    expect(decideLang({ ...base, pathname: "/en", country: "JP", cookie: "ja" })).toBeNull();
    expect(decideLang({ ...base, pathname: "/fr/projects/booking", country: "JP" })).toBeNull();
  });

  it("?hl= は Cookie に覚えて、その言語の道へ（ほかのクエリは残す）", () => {
    expect(decideLang({ ...base, pathname: "/en/kits", search: "?hl=ja", country: "US" })).toEqual({
      redirect: "/kits",
      setCookie: "ja",
    });
    expect(decideLang({ ...base, pathname: "/", search: "?hl=fr" })).toEqual({ redirect: "/fr", setCookie: "fr" });
    expect(decideLang({ ...base, pathname: "/projects/saas-starter", search: "?lang=en&hl=en" })).toEqual({
      redirect: "/en/projects/saas-starter?lang=en",
      setCookie: "en",
    });
    // ボットが切り替えのリンクをたどっても同じ（行き先はその言語の正規の道）
    expect(decideLang({ ...base, pathname: "/kits", search: "?hl=en", userAgent: GOOGLEBOT })).toEqual({
      redirect: "/en/kits",
      setCookie: "en",
    });
  });

  it("訳の無い道には働かない", () => {
    expect(decideLang({ ...base, pathname: "/demos/shop-lp", country: "US" })).toBeNull();
    expect(decideLang({ ...base, pathname: "/guides/booking-page", country: "US" })).toBeNull();
    expect(decideLang({ ...base, pathname: "/projects/unknown", country: "US" })).toBeNull();
    expect(decideLang({ ...base, pathname: "/en/demos/shop-lp", country: "US" })).toBeNull();
    expect(decideLang({ ...base, pathname: "/demos/shop-lp", search: "?hl=en" })).toBeNull();
  });
});

describe("noteLang（日本語だけの紙の断り書き）", () => {
  it("選んだ言語が先。日本語なら出さない", () => {
    expect(noteLang("fr", "en-US")).toBe("fr");
    expect(noteLang("en", "fr-FR")).toBe("en");
    expect(noteLang("ja", "en-US")).toBeNull();
  });
  it("Cookie が無ければブラウザの第一言語。仏語以外は英語", () => {
    expect(noteLang(null, "fr-CA")).toBe("fr");
    expect(noteLang(null, "de-DE")).toBe("en");
    expect(noteLang(null, "ja-JP")).toBeNull();
    expect(noteLang("xx", undefined)).toBeNull();
  });
});
