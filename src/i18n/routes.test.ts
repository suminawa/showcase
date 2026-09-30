import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { languageAlternates, pageMetadata } from "./meta";
import { TRANSLATED_PATHS, hrefFor, localePath, splitLang } from "./routes";

const APP = path.resolve(__dirname, "../app");

describe("道", () => {
  it("日本語は今の道のまま、英仏は頭に付ける", () => {
    expect(localePath("ja", "/")).toBe("/");
    expect(localePath("en", "/")).toBe("/en");
    expect(localePath("fr", "/kits")).toBe("/fr/kits");
  });
  it("道から言語を外す", () => {
    expect(splitLang("/en")).toEqual({ lang: "en", path: "/" });
    expect(splitLang("/fr/projects/booking")).toEqual({ lang: "fr", path: "/projects/booking" });
    expect(splitLang("/kits")).toEqual({ lang: "ja", path: "/kits" });
    expect(splitLang("/english")).toEqual({ lang: "ja", path: "/english" });
  });
  it("紙の中のリンクは、訳のある紙へだけ言語の道を付ける", () => {
    expect(hrefFor("en", "/contact")).toBe("/en/contact");
    expect(hrefFor("fr", "/projects/configurator#shopify")).toBe("/fr/projects/configurator#shopify");
    expect(hrefFor("en", "/demos/shop-lp")).toBe("/demos/shop-lp");
    expect(hrefFor("en", "/go/booking/note?from=/en/kits")).toBe("/go/booking/note?from=/en/kits");
    expect(hrefFor("ja", "/kits")).toBe("/kits");
  });
});

describe("訳のある紙のファイル", () => {
  it("日本語のページと [lang] のページが両方ある", () => {
    for (const p of TRANSLATED_PATHS) {
      const rel = p === "/" ? "" : p;
      expect(existsSync(path.join(APP, rel, "page.tsx")), `ja: ${p}`).toBe(true);
      expect(existsSync(path.join(APP, "[lang]", rel, "page.tsx")), `[lang]: ${p}`).toBe(true);
    }
  });
});

describe("hreflang と canonical", () => {
  it("三言語と x-default（日本語の道）", () => {
    expect(languageAlternates("/kits")).toEqual({ ja: "/kits", en: "/en/kits", fr: "/fr/kits", "x-default": "/kits" });
    expect(languageAlternates("/")).toEqual({ ja: "/", en: "/en", fr: "/fr", "x-default": "/" });
  });
  it("canonical はその言語の道で、OGP の locale も合わせる", () => {
    const meta = pageMetadata("fr", "/projects/booking", { title: "t", description: "d", image: "/og/booking.png" });
    expect(meta.alternates?.canonical).toBe("/fr/projects/booking");
    expect(meta.alternates?.languages).toEqual(languageAlternates("/projects/booking"));
    expect(meta.openGraph).toMatchObject({ locale: "fr_FR", url: "/fr/projects/booking", images: ["/og/booking.png"] });
  });
});
