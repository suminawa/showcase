import { describe, expect, it } from "vitest";
import { NAV_BASE, NAV_LINKS } from "./nav";

describe("corporate nav", () => {
  it("リンクは 4 本、この順で並ぶ", () => {
    expect(NAV_LINKS.map((link) => link.label)).toEqual([
      "ホーム",
      "事業内容",
      "会社概要",
      "お問い合わせ",
    ]);
  });

  it("行き先は 4 枚の面と一致する", () => {
    expect(NAV_LINKS.map((link) => link.href)).toEqual([
      "/demos/corporate-site",
      "/demos/corporate-site/services",
      "/demos/corporate-site/company",
      "/demos/corporate-site/contact",
    ]);
  });

  it("最初のリンクは TOP そのもの", () => {
    expect(NAV_BASE).toBe("/demos/corporate-site");
    expect(NAV_LINKS[0].href).toBe(NAV_BASE);
  });

  it("行き先も名前も重ならない", () => {
    expect(new Set(NAV_LINKS.map((link) => link.href)).size).toBe(4);
    expect(new Set(NAV_LINKS.map((link) => link.label)).size).toBe(4);
  });
});
