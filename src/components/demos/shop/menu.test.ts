import { describe, expect, it } from "vitest";
import { formatPrice, MENU, MENU_GROUPS, menuByCategory } from "./menu";

describe("shop menu", () => {
  it("品は 6 つ、id は重ならない", () => {
    expect(MENU).toHaveLength(6);
    expect(new Set(MENU.map((item) => item.id)).size).toBe(6);
  });

  it("焼き菓子と飲みものが 3 品ずつ、並びは MENU のまま", () => {
    expect(menuByCategory("bake").map((item) => item.id)).toEqual([
      "scone",
      "weekend",
      "cookie",
    ]);
    expect(menuByCategory("drink").map((item) => item.id)).toEqual([
      "coffee",
      "milk-brew",
      "hojicha",
    ]);
  });

  it("組は焼き菓子・飲みものの二つで、どちらにも品がある", () => {
    expect(MENU_GROUPS.map((group) => group.category)).toEqual([
      "bake",
      "drink",
    ]);
    expect(MENU_GROUPS.map((group) => group.label)).toEqual([
      "焼き菓子",
      "飲みもの",
    ]);
    for (const group of MENU_GROUPS) {
      expect(menuByCategory(group.category).length).toBeGreaterThan(0);
    }
  });

  it("組をすべて足すと品書き全体になる（漏れも重なりもない）", () => {
    expect(
      MENU_GROUPS.flatMap((g) => menuByCategory(g.category))
    ).toHaveLength(MENU.length);
  });

  it("価格は 300 円以上 1000 円未満の 10 円単位", () => {
    for (const item of MENU) {
      expect(item.price).toBeGreaterThanOrEqual(300);
      expect(item.price).toBeLessThan(1000);
      expect(item.price % 10).toBe(0);
    }
  });

  it("どの品にも名前と一言の説明がある", () => {
    for (const item of MENU) {
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.note.length).toBeGreaterThan(0);
      expect(item.note.endsWith("。")).toBe(true);
    }
  });

  it("formatPrice は三桁区切りに「円」を付ける", () => {
    expect(formatPrice(380)).toBe("380 円");
    expect(formatPrice(1200)).toBe("1,200 円");
  });
});
