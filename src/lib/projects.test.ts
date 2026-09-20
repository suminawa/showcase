import { describe, expect, it } from "vitest";
import links from "../data/links.json";
import {
  SERVICES,
  SERVICES_NOTE,
  SHELVES,
  projectFigure,
  projectHref,
  projects,
  projectsByCategory,
  saleLabel,
  shelfAnchors,
} from "./projects";

describe("段の並び", () => {
  it("承ります → KITS → SITES → WORKS の順で 4 つ", () => {
    expect(SHELVES.map((s) => s.id)).toEqual([
      "services",
      "kits",
      "sites",
      "works",
    ]);
    expect(SHELVES.map((s) => s.label)).toEqual([
      "承ります",
      "KITS",
      "SITES",
      "WORKS",
    ]);
  });

  it("GAMES の段は無い（中身の無い段は持たない）", () => {
    expect(SHELVES.map((s) => s.id)).not.toContain("games");
    for (const shelf of SHELVES) {
      if (shelf.id === "services") continue;
      expect(projectsByCategory(shelf.id).length).toBeGreaterThan(0);
    }
  });

  it("頭の一行を持つのは品物の段だけ。承ります は見出しだけ", () => {
    expect(SHELVES[0].lead).toBeUndefined();
    for (const shelf of SHELVES.slice(1)) {
      expect(shelf.lead).toBeTruthy();
    }
  });

  it("SITES の頭の一行が、見本と LP テンプレ パックの関係を言う", () => {
    const sites = SHELVES.find((s) => s.id === "sites");
    expect(sites?.lead).toBe(
      "どれも架空の会社で作った見本です。業種別 LP テンプレ パックの中身でもあります。",
    );
  });
});

describe("承ります の品書き", () => {
  it("4 行。数字は公開済みの受託メニューにあるものだけ", () => {
    expect(SERVICES.map((s) => s.title)).toEqual([
      "サイト・LP の制作",
      "業務の自動化（Google Apps Script）",
      "埋め込み部品の設置（AI 案内窓口・間取り・3D の商品ページ）",
      "WebGL / GLSL の演出",
    ]);
    expect(SERVICES.map((s) => s.price)).toEqual([
      "1 ページの LP は 150,000 円から",
      "既製キットの導入は 30,000 円、個別の開発は 40,000 円から",
      "60,000 円から",
      "50,000 円から",
    ]);
  });

  it("結びは税別の断りと宛先", () => {
    expect(SERVICES_NOTE.mail).toBe("hello@suminawa.dev");
    expect(SERVICES_NOTE.before).toContain("税別の目安");
  });
});

describe("projects registry", () => {
  it("全作品が段のどれかに属する", () => {
    const ids = SHELVES.map((s) => s.id);
    for (const project of projects) {
      expect(ids).toContain(project.category);
    }
  });

  it("KITS は発売中 5 本が先、発売前 5 本が後", () => {
    const kits = projectsByCategory("kits");
    expect(kits.map((p) => p.slug)).toEqual([
      "quote-simulator",
      "deadline-alert",
      "form-intake",
      "floorplan",
      "lp-pack",
      "ai-concierge",
      "sheet-app",
      "doc-reader",
      "booking",
      "configurator",
    ]);
    expect(kits.map((p) => p.sale?.status)).toEqual([
      ...Array(5).fill("onsale"),
      ...Array(5).fill("upcoming"),
    ]);
  });

  it("値段はレジストリの 1 か所。発売前には値段を持たせない", () => {
    const price = Object.fromEntries(
      projectsByCategory("kits").map((p) => [p.slug, p.sale?.price]),
    );
    expect(price).toEqual({
      "quote-simulator": 2980,
      "deadline-alert": 2980,
      "form-intake": 3480,
      floorplan: 9800,
      "lp-pack": 6980,
      "ai-concierge": undefined,
      "sheet-app": undefined,
      "doc-reader": undefined,
      booking: undefined,
      configurator: undefined,
    });
  });

  it("saleLabel は発売中なら値段、発売前なら言葉だけ", () => {
    expect(saleLabel({ status: "onsale", price: 2980 })).toBe("発売中 ¥2,980");
    expect(saleLabel({ status: "onsale", price: 9800 })).toBe("発売中 ¥9,800");
    expect(saleLabel({ status: "onsale", price: 150000 })).toBe(
      "発売中 ¥150,000",
    );
    expect(saleLabel({ status: "upcoming" })).toBe("発売前");
    // 値段の抜けた発売中は、嘘の値を出すより「発売前」に倒す
    expect(saleLabel({ status: "onsale" })).toBe("発売前");
  });

  it("作品ページを持たない 3 本は、note と紙の中の段へ飛ぶ", () => {
    const by = Object.fromEntries(projects.map((p) => [p.slug, p]));
    expect(projectHref(by["deadline-alert"])).toBe(links.s2.note);
    expect(projectHref(by["form-intake"])).toBe(links.s3.note);
    expect(projectHref(by["lp-pack"])).toBe("#sites");
  });

  it("projectHref は /projects/<slug>、見本は /demos/<slug> を返す", () => {
    const by = Object.fromEntries(projects.map((p) => [p.slug, p]));
    expect(projectHref(by["quote-simulator"])).toBe(
      "/projects/quote-simulator",
    );
    expect(projectHref(by.floorplan)).toBe("/projects/floorplan");
    expect(projectHref(by["tax-back"])).toBe("/projects/tax-back");
    expect(projectHref(by["30days"])).toBe("/projects/30days");
    const sites = projectsByCategory("sites");
    expect(projectHref(sites[0])).toBe("/demos/corporate-site");
    expect(projectHref(sites[sites.length - 1])).toBe("/demos/clinic-lp");
  });

  it("図版を持つのは、この紙の中に自分のページを持つ行だけ", () => {
    const by = Object.fromEntries(projects.map((p) => [p.slug, p]));
    expect(projectFigure(by["quote-simulator"])).toBe("/hub/quote-simulator");
    expect(projectFigure(by["corporate-site"])).toBe("/hub/corporate-site");
    expect(projectFigure(by["deadline-alert"])).toBeNull();
    expect(projectFigure(by["form-intake"])).toBeNull();
    expect(projectFigure(by["lp-pack"])).toBeNull();
    // 図版なしは 3 本だけ。ほかは全部 1 枚持つ
    expect(projects.filter((p) => projectFigure(p) === null)).toHaveLength(3);
  });

  it("SITES は見本 6 件、WORKS は作品と道具 3 件", () => {
    expect(projectsByCategory("sites").map((p) => p.slug)).toEqual([
      "corporate-site",
      "saas-lp",
      "shop-lp",
      "construction-lp",
      "professional-lp",
      "clinic-lp",
    ]);
    expect(projectsByCategory("works").map((p) => p.slug)).toEqual([
      "suminagashi",
      "tax-back",
      "30days",
    ]);
  });

  it("説明は 2 行に収まる幅、タグは 1 つ以上", () => {
    // 折り返しは字数ではなく【幅】で決まる。全角を 1、半角を 0.5 として数える。
    // PC の字の塊は図版を引いて約 25 全角ぶんなので、2 行は 50 ── 余裕を見て 42。
    const em = (text: string) =>
      [...text].reduce((n, c) => n + (c.charCodeAt(0) < 0x2e80 ? 0.5 : 1), 0);

    for (const project of projects) {
      expect(em(project.description)).toBeLessThanOrEqual(42);
      expect(project.tags.length).toBeGreaterThan(0);
    }
  });

  it("slug は品物と見本をまたいで重ならない", () => {
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
  });
});

describe("shelfAnchors", () => {
  it("SHELVES と同じ順で 4 件を返す", () => {
    const anchors = shelfAnchors();
    expect(anchors).toHaveLength(4);
    expect(anchors.map((a) => a.id)).toEqual(SHELVES.map((s) => s.id));
    expect(anchors.map((a) => a.label)).toEqual(SHELVES.map((s) => s.label));
  });

  it("anchor は # + id の形", () => {
    for (const anchor of shelfAnchors()) {
      expect(anchor.anchor).toBe(`#${anchor.id}`);
      expect(anchor.anchor).toMatch(/^#[a-z]+$/);
    }
  });

  it("LP テンプレ パックの飛び先は、目次と同じ SITES の段の id", () => {
    const sites = shelfAnchors().find((a) => a.id === "sites");
    const pack = projects.find((p) => p.slug === "lp-pack");
    expect(pack?.href).toBe(sites?.anchor);
  });
});
