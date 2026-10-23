import { describe, expect, it } from "vitest";

import { guides } from "./guides";
import { llmsText } from "./llms";
import { PILLARS, pillarKits } from "./projects";
import { SITE_NAME } from "./site";

describe("llms.txt", () => {
  it("名乗り・三つの柱・柱のキット・全部の記事・連絡先が、目録から載る", () => {
    const text = llmsText();
    expect(text.startsWith(`# ${SITE_NAME}\n`)).toBe(true);
    for (const pillar of PILLARS) {
      expect(text).toContain(`## ${pillar.name}`);
      for (const p of pillarKits(pillar)) expect(text).toContain(`[${p.title}]`);
    }
    for (const g of guides) expect(text).toContain(`/guides/${g.slug})`);
    expect(text).toContain("hello@suminawa.dev");
    expect(text).not.toContain("答え: ");
  });
  it("full は記事の答えとよくあるご質問も持つ", () => {
    const text = llmsText({ full: true });
    expect(text).toContain(`答え: ${guides[0].answer}`);
    expect(text).toContain("## よくあるご質問");
  });
});
