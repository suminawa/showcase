/*
 * 訳のある紙の文（各ディレクトリの copy.ts、GAS キットの結び）が、三言語で同じ形を持つこと。
 * 型は形の大枠しか縛らない（配列の長さや空の文字列は通してしまう）ので、ここで中身まで照らす。
 */
import { describe, expect, it } from "vitest";

import { BASES_FOR_TEST } from "@/lib/kit-demos";

import { KIT_DEMOS_I18N } from "./kit-demos";
import { FOREIGN_LANGS, TRANSLATED_PATHS } from "./routes";

const COPIES = import.meta.glob<{ copy: Record<string, unknown> }>("../app/**/copy.ts", { eager: true });

/** 値の形（鍵と配列の長さ）。文字列は "s"、関数は "f" */
function shape(v: unknown): unknown {
  if (typeof v === "string") return "s";
  if (typeof v === "function") return "f";
  if (Array.isArray(v)) return v.map(shape);
  if (v && typeof v === "object") {
    return Object.fromEntries(
      Object.keys(v)
        .sort()
        .map((k) => [k, shape((v as Record<string, unknown>)[k])]),
    );
  }
  return typeof v;
}

function strings(v: unknown, at = ""): [string, string][] {
  if (typeof v === "string") return [[at, v]];
  if (Array.isArray(v)) return v.flatMap((x, i) => strings(x, `${at}[${i}]`));
  if (v && typeof v === "object") return Object.entries(v).flatMap(([k, x]) => strings(x, `${at}.${k}`));
  return [];
}

const JAPANESE = /[぀-ヿ一-鿿]/;

describe("訳のある紙の copy.ts", () => {
  it("訳のある紙（トップと作品ページ）はすべて copy.ts を持つ", () => {
    const dirs = Object.keys(COPIES).map((f) => f.replace(/^\.\.\/app/, "").replace(/\/copy\.ts$/, "") || "/");
    for (const p of TRANSLATED_PATHS) {
      // 分類のページと /contact は目録（src/i18n/catalog.ts）から組む
      if (["/works", "/kits", "/sites", "/contact"].includes(p)) continue;
      expect(dirs, p).toContain(p);
    }
  });

  for (const [file, mod] of Object.entries(COPIES)) {
    describe(file, () => {
      it("ja・en・fr が同じ形", () => {
        expect(Object.keys(mod.copy).sort()).toEqual(["en", "fr", "ja"]);
        for (const lang of FOREIGN_LANGS) expect(shape(mod.copy[lang]), lang).toEqual(shape(mod.copy.ja));
      });
      it("英仏に空の文字列が無く、日本語の字は道具の名（日本語 のボタン）だけ", () => {
        for (const lang of FOREIGN_LANGS) {
          for (const [at, text] of strings(mod.copy[lang])) {
            expect(text.trim(), `${lang}${at}`).not.toBe("");
            expect(text.replace(/日本語/g, ""), `${lang}${at}`).not.toMatch(JAPANESE);
          }
        }
      });
    });
  }
});

describe("GAS キットの結び", () => {
  it("英仏は日本語と同じ形で、比べる相手の URL も同じ", () => {
    for (const lang of FOREIGN_LANGS) {
      for (const [slug, ja] of Object.entries(BASES_FOR_TEST)) {
        const local = KIT_DEMOS_I18N[lang][slug as keyof typeof KIT_DEMOS_I18N.en];
        expect(shape(local), `${lang} ${slug}`).toEqual(shape(ja));
        expect(local.linkKey).toBe(ja.linkKey);
        const hrefs = (d: typeof ja) => [...d.freeEnough.map((f) => f.alt.href), ...d.fits.flatMap((f) => f.alts?.map((a) => a.href) ?? [])];
        expect(hrefs(local)).toEqual(hrefs(ja));
        for (const [at, text] of strings(local)) expect(text, `${lang} ${slug}${at}`).not.toMatch(JAPANESE);
      }
    }
  });
});
