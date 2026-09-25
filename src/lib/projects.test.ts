import { describe, expect, it } from "vitest";
import links from "../data/links.json";
import {
  CONTACT_PAGE,
  FEATURED,
  GATES,
  INDEX_PAGES,
  SERVICES,
  SERVICES_NOTE,
  STEPS,
  categoryCount,
  countLabel,
  featuredProjects,
  projectFigure,
  projectHref,
  projects,
  projectsByCategory,
  saleLabel,
} from "./projects";

describe("入口 3 行", () => {
  it("Kits → Sites → Works の順で 3 本。飛び先は分類のページ", () => {
    expect(GATES.map((g) => g.id)).toEqual(["kits", "sites", "works"]);
    expect(GATES.map((g) => g.label)).toEqual(["Kits", "Sites", "Works"]);
    expect(GATES.map((g) => g.href)).toEqual(["/kits", "/sites", "/works"]);
  });

  it("どの行も日本語の一行を持つ", () => {
    for (const gate of GATES) {
      expect(gate.lead.length).toBeGreaterThan(0);
      expect(gate.lead).not.toMatch(/[。]$/);
    }
  });

  it("件数はレジストリから数える（手で書かない）", () => {
    expect(categoryCount("kits")).toEqual({ total: 14, onsale: 14 });
    expect(categoryCount("sites")).toEqual({ total: 6, onsale: 0 });
    expect(categoryCount("works")).toEqual({ total: 4, onsale: 0 });

    expect(countLabel("kits")).toBe("14 件　発売中 12 件");
    expect(countLabel("sites")).toBe("6 件");
    expect(countLabel("works")).toBe("4 件");
  });

  it("入口の件数と、その先のページに並ぶ行数が一致する", () => {
    for (const gate of GATES) {
      expect(countLabel(gate.id).startsWith(
        `${projectsByCategory(gate.id).length} 件`,
      )).toBe(true);
    }
  });
});

describe("分類のページの頭", () => {
  it("入口の英字と、そのページの題に添える英字が同じ", () => {
    for (const gate of GATES) {
      expect(INDEX_PAGES[gate.id].latin).toBe(gate.label);
    }
  });

  it("題と一行を持ち、一行は敬体で終わる", () => {
    for (const id of ["kits", "sites", "works"] as const) {
      expect(INDEX_PAGES[id].title.length).toBeGreaterThan(0);
      expect(INDEX_PAGES[id].lede).toMatch(/。$/);
    }
    expect(CONTACT_PAGE.title).toBe("制作のご相談");
    expect(CONTACT_PAGE.latin).toBe("Contact");
    expect(CONTACT_PAGE.lede).toMatch(/。$/);
  });

  it("SITES の一行が、見本と LP テンプレ パックの関係を言う", () => {
    expect(INDEX_PAGES.sites.lede).toBe(
      "どれも架空の会社で作った見本です。業種別 LP テンプレ パックの中身でもあります。",
    );
  });
});

describe("いま見てほしいもの 4 点", () => {
  it("並びは 1 か所。AI 案内窓口・AI 書類読み取り・3D・墨流し", () => {
    expect(FEATURED).toEqual([
      "ai-concierge",
      "doc-reader",
      "configurator",
      "suminagashi",
    ]);
    expect(featuredProjects().map((p) => p.slug)).toEqual([...FEATURED]);
  });

  it("4 点とも、この紙の中の作品ページへ飛ぶ", () => {
    for (const project of featuredProjects()) {
      expect(projectHref(project).startsWith("/projects/")).toBe(true);
    }
  });
});

describe("制作のご相談", () => {
  it("頼めること 4 行。数字は公開済みの受託メニューにあるものだけ", () => {
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

  it("進め方は 3 段", () => {
    expect(STEPS.map((s) => s.title)).toEqual([
      "ご相談",
      "お見積もり",
      "制作と納品",
    ]);
  });

  it("結びは税別の断りと宛先", () => {
    expect(SERVICES_NOTE.mail).toBe("hello@suminawa.dev");
    expect(SERVICES_NOTE.before).toContain("税別の目安");
  });
});

describe("projects registry", () => {
  it("全作品が分類のどれかに属する", () => {
    const ids = GATES.map((g) => g.id);
    for (const project of projects) {
      expect(ids).toContain(project.category);
      if (project.alsoIn) expect(ids).toContain(project.alsoIn);
    }
  });

  it("kits は 14 本すべて発売中（発売の順）", () => {
    const kits = projectsByCategory("kits");
    expect(kits.map((p) => p.slug)).toEqual([
      "quote-simulator",
      "deadline-alert",
      "form-intake",
      "floorplan",
      "lp-pack",
      "ai-concierge",
      "doc-reader",
      "sheet-app",
      "booking",
      "inbox-triage",
      "line-concierge",
      "dashboard",
      "configurator",
      "saas-starter",
    ]);
    expect(kits.map((p) => p.sale?.status)).toEqual(Array(14).fill("onsale"));
  });

  it("値段はレジストリの 1 か所。定価を持ち、発売前は決まったものだけが持つ", () => {
    const price = Object.fromEntries(
      projectsByCategory("kits").map((p) => [p.slug, p.sale?.price]),
    );
    expect(price).toEqual({
      "quote-simulator": 2980,
      "deadline-alert": 2980,
      "form-intake": 3480,
      floorplan: 9800,
      "lp-pack": 6980,
      // 2026-09-21 に発売した 2 本。どちらも定価（発売記念の値ではない）
      "ai-concierge": 12800,
      "doc-reader": 16800,
      // 2026-09-22 に発売した 2 本。こちらも定価
      "sheet-app": 12800,
      booking: 7980,
      // 2026-09-23 に発売した 2 本（問い合わせ整理は作品ページ無し。note の記事へ直に）
      "inbox-triage": 5980,
      // 2026-09-24 に発売。作品ページ無し（LINE の中で動く）
      "line-concierge": 12800,
      dashboard: 9800,
      configurator: 12800,
      "saas-starter": 19800,
    });
  });

  it("saleLabel は発売中なら定価、発売前なら言葉だけ", () => {
    expect(saleLabel({ status: "onsale", price: 2980 })).toBe("発売中 ¥2,980");
    expect(saleLabel({ status: "onsale", price: 12800 })).toBe(
      "発売中 ¥12,800",
    );
    expect(saleLabel({ status: "onsale", price: 150000 })).toBe(
      "発売中 ¥150,000",
    );
    expect(saleLabel({ status: "upcoming" })).toBe("発売前");
    // 値段の抜けた発売中は、嘘の値を出すより「発売前」に倒す
    expect(saleLabel({ status: "onsale" })).toBe("発売前");
  });

  it("作品ページを持たない 2 本は、同じ名義の note の記事へ飛ぶ", () => {
    const by = Object.fromEntries(projects.map((p) => [p.slug, p]));
    expect(projectHref(by["deadline-alert"])).toBe(links.s2.note);
    expect(projectHref(by["form-intake"])).toBe(links.s3.note);
    // 紙の中の段へ跳ねる行はもう無い（段ではなくページへ渡す）
    for (const project of projects) {
      expect(projectHref(project).startsWith("#")).toBe(false);
    }
  });

  it("LP テンプレ パックは、中身の 6 本が並ぶ紙へ渡す", () => {
    const by = Object.fromEntries(projects.map((p) => [p.slug, p]));
    expect(projectHref(by["lp-pack"])).toBe("/sites");
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

  it("図版を持つのは、見た目そのものが中身である行だけ", () => {
    const by = Object.fromEntries(projects.map((p) => [p.slug, p]));
    // 見本サイトは「その見た目」が商品。墨流しは作品そのものが絵である
    expect(projectFigure(by["corporate-site"])).toBe("/hub/corporate-site");
    expect(projectFigure(by["suminagashi"])).toBe("/hub/suminagashi");
    // 道具とキットは持たない。何をする道具かは動きにあり、
    // 196px の写しでは白い枠のなかで字が潰れるだけだった
    expect(projectFigure(by["quote-simulator"])).toBeNull();
    expect(projectFigure(by["ai-concierge"])).toBeNull();
    expect(projectFigure(by["deadline-alert"])).toBeNull();
    expect(projectFigure(by["lp-pack"])).toBeNull();
    expect(projects.filter((p) => projectFigure(p) !== null)).toHaveLength(7);
  });

  it("sites は見本 6 件、works は作品と道具 4 件（無料で触れる電卓を含む）", () => {
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
      // 主の分類は kits。借りてきた行は後ろに添える
      "quote-simulator",
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
