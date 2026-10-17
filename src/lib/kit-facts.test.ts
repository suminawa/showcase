import { describe, expect, it } from "vitest";

import { kitDemo } from "./kit-demos";
import { FLAGSHIPS, KIT_FACTS } from "./kit-facts";
import { FEATURED } from "./projects";

describe("看板 3 本の帳票", () => {
  it("看板 3 本と同じ並び", () => {
    expect([...FLAGSHIPS]).toEqual([...FEATURED]);
  });

  it("三言語とも同じ数の欄を、月額 → 置く時間の順で持つ", () => {
    for (const slug of FLAGSHIPS) {
      const ja = KIT_FACTS[slug].ja;
      expect(ja[0].label).toBe("月額");
      expect(ja[1].label).toBe("置く時間");
      expect(KIT_FACTS[slug].en).toHaveLength(ja.length);
      expect(KIT_FACTS[slug].fr).toHaveLength(ja.length);
    }
  });

  it("置く時間は手順書の時間（kit-demos の setup）と食い違わない", () => {
    for (const slug of FLAGSHIPS) {
      const minutes = KIT_FACTS[slug].ja[1].value.replace(/ほど$/, "");
      expect(kitDemo(slug).setup).toContain(minutes);
      expect(kitDemo(slug).setup).toMatch(/月額の費用はかかりません/);
    }
  });
});
