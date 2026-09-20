import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { projectFigure, projects } from "./projects";

/*
 * 図版の撮り漏れを止める見張り。
 *
 * ハブの行が図版を持つかどうかを決めるのは projectFigure()、実際に撮るのは
 * scripts/shoot-hub.mjs で、二つは別のところに書いてある。品物を足したときに
 * 撮る側だけ忘れると、本番で図版の枠だけが空く（ビルドも型検査も通ってしまう）。
 * ここで両者の slug を突き合わせておけば、忘れた時点で落ちる。
 *
 * スクリプトは import せずに読む ── Playwright を別の checkout から
 * 読み込んでいるので、テストの側でその有無に縛られたくない。
 */
const SCRIPT = path.resolve(__dirname, "../../scripts/shoot-hub.mjs");

function shotSlugs(): string[] {
  const src = readFileSync(SCRIPT, "utf8");
  const body = src.slice(src.indexOf("const SHOTS = ["), src.indexOf("\n];"));
  return [...body.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
}

describe("図版を撮るスクリプト", () => {
  it("図版を持つ行と、撮る対象が過不足なく一致する", () => {
    const want = projects
      .filter((project) => projectFigure(project) !== null)
      .map((project) => project.slug);

    expect([...shotSlugs()].sort()).toEqual([...want].sort());
  });

  it("撮る対象に重複がない", () => {
    const slugs = shotSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
