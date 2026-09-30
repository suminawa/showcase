import { describe, expect, it } from "vitest";

import { guides } from "@/lib/guides";
import { GATES, projects, priceLabel, saleLabel, type Sale } from "@/lib/projects";

import { CATALOG, localPriceLabel, localProject, localSaleLabel } from "./catalog";
import { FOREIGN_LANGS } from "./routes";
import { dateLabel, money } from "./ui";

describe("目録の英仏", () => {
  it("すべての品物に en・fr の題と一行がある", () => {
    for (const lang of FOREIGN_LANGS) {
      for (const p of projects) {
        const line = CATALOG[lang].projects[p.slug];
        expect(line?.title, `${lang} ${p.slug}`).toBeTruthy();
        expect(line?.description, `${lang} ${p.slug}`).toBeTruthy();
      }
      // 目録に無い slug の訳は残さない（品物を消したときに訳だけが残らないように）
      expect(Object.keys(CATALOG[lang].projects).sort()).toEqual(projects.map((p) => p.slug).sort());
    }
  });

  it("英仏の札に日本語の字が残らない（技術名の札はそのまま）", () => {
    for (const lang of FOREIGN_LANGS) {
      for (const p of projects) {
        for (const tag of localProject(lang, p).tags) expect(tag, `${lang} ${p.slug}`).not.toMatch(/[぀-ヿ一-鿿]/);
      }
    }
  });

  it("入口・guides にも en・fr がある", () => {
    for (const lang of FOREIGN_LANGS) {
      for (const g of GATES) expect(CATALOG[lang].gates[g.id]).toBeTruthy();
      for (const g of guides) expect(CATALOG[lang].guides.titles[g.slug], `${lang} ${g.slug}`).toBeTruthy();
    }
  });

  it("品書きの結びに返信の言語の一文を入れない（9/30 持ち主の判断）", () => {
    expect(CATALOG.en.servicesNote.before).toBe("Prices are estimates, excluding tax. For requests and questions, write to ");
    expect(CATALOG.fr.servicesNote.before).toBe("Tarifs indicatifs, hors taxes. Pour toute demande : ");
  });

  it("料金の目安の行数は日本語と同じ", async () => {
    const { SERVICES, SERVICES_BRIEF, STEPS } = await import("@/lib/projects");
    for (const lang of FOREIGN_LANGS) {
      expect(CATALOG[lang].services).toHaveLength(SERVICES.length);
      expect(CATALOG[lang].servicesBrief).toHaveLength(SERVICES_BRIEF.length);
      expect(CATALOG[lang].steps).toHaveLength(STEPS.length);
    }
  });
});

describe("値札", () => {
  const DATES = ["2026-09-20T00:00:00+09:00", "2026-09-30T23:59:00+09:00", "2026-10-01T00:00:00+09:00", "2026-12-01T00:00:00+09:00"];

  it("日本語は saleLabel と同じ字（発売記念の前後とも）", () => {
    for (const d of DATES) {
      const now = new Date(d);
      for (const p of projects) expect(localPriceLabel("ja", p, now)).toBe(priceLabel(p, now));
    }
    const upcoming: Sale = { status: "upcoming", launch: "10/2", price: 9800 };
    expect(localSaleLabel("ja", upcoming, { detail: true })).toBe(saleLabel(upcoming, { detail: true }));
    expect(localSaleLabel("ja", upcoming)).toBe(saleLabel(upcoming));
  });

  it("英仏も同じ時刻で記念の値から定価へ切り替わる", () => {
    const sheet = projects.find((p) => p.slug === "sheet-app")!;
    expect(localPriceLabel("en", sheet, new Date("2026-10-02T23:59:00+09:00"))).toBe(
      "Launch price ¥9,800 (until Oct 2, then ¥12,800)",
    );
    expect(localPriceLabel("en", sheet, new Date("2026-10-03T00:00:00+09:00"))).toBe("¥12,800");
    expect(localPriceLabel("fr", sheet, new Date("2026-10-02T12:00:00+09:00"))).toBe(
      "Prix de lancement 9 800 ¥ (jusqu’au 2 oct., puis 12 800 ¥)",
    );
  });

  it("円と日付の書き方", () => {
    expect(money("en", 150000)).toBe("¥150,000");
    expect(money("fr", 2980)).toBe("2 980 ¥");
    expect(dateLabel("en", "2026-10-02")).toBe("Oct 2");
    expect(dateLabel("fr", "2026-09-30")).toBe("30 sept.");
    expect(dateLabel("ja", "2026-10-02")).toBe("10/2");
  });
});
