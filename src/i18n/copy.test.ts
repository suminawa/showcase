/*
 * 訳のある紙の文（各ディレクトリの copy.ts、GAS キットの結び）が、三言語で同じ形を持つこと。
 * 型は形の大枠しか縛らない（配列の長さや空の文字列は通してしまう）ので、ここで中身まで照らす。
 */
import { describe, expect, it } from "vitest";

import { BASES_FOR_TEST } from "@/lib/kit-demos";

import { KIT_DEMOS_I18N } from "./kit-demos";
import { FOREIGN_LANGS, TRANSLATED_PATHS } from "./routes";

const COPIES = import.meta.glob("../app/**/copy.ts", { eager: true }) as unknown as Record<
  string,
  { copy: Record<string, unknown> }
>;

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
    const dirs = Object.keys(COPIES).map((f) => f.replace(/^\.\.\/app(\/\(ja\))?/, "").replace(/\/copy\.ts$/, "") || "/");
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

describe("作品ページの本文の発売記念の値段（prices.ts の最終日で消える）", async () => {
  const { projectPriceNow } = await import("./catalog");
  const { copy: configurator } = await import("@/app/(ja)/projects/configurator/copy");
  const at = (iso: string) => new Date(iso);
  // 仏語の額は money() の細い空き（U+202F・U+00A0）で組む。字の照合では普通の空きに寄せる
  const plain = (text: string) => text.replace(/[\u202f\u00a0]/g, " ");

  it("最終日の 23:59（日本時間）までは記念価格と最終日。日本語は今までの字のまま", () => {
    const sep30 = at("2026-09-30T23:59:00+09:00");
    expect(plain(configurator.ja.kit(projectPriceNow("configurator", sep30)))).toBe(
      "この 3D 商品コンフィギュレーターを自分のサイトに置ける版（定価 ¥12,800 の買い切り。9 月 30 日までは発売記念 ¥9,800。見本のモデルと設定つき）",
    );
    expect(plain(configurator.en.kit(projectPriceNow("configurator", sep30)))).toBe(
      "A version of this 3D product configurator for your own site (regular price ¥12,800, one-time purchase; launch price ¥9,800 until September 30; includes sample models and configurations)",
    );
    expect(plain(configurator.fr.kit(projectPriceNow("configurator", sep30)))).toBe(
      "Une version de ce configurateur 3D pour votre propre site (prix normal 12 800 ¥, achat unique ; prix de lancement 9 800 ¥ jusqu’au 30 septembre ; modèles et configurations d’exemple inclus)",
    );
  });

  it("翌日の 00:00（日本時間）からは定価だけ", () => {
    const oct1 = at("2026-10-01T00:00:00+09:00");
    expect(plain(configurator.ja.kit(projectPriceNow("configurator", oct1)))).toBe(
      "この 3D 商品コンフィギュレーターを自分のサイトに置ける版（¥12,800 の買い切り。見本のモデルと設定つき）",
    );
    expect(plain(configurator.en.kit(projectPriceNow("configurator", oct1)))).toBe(
      "A version of this 3D product configurator for your own site (¥12,800, one-time purchase; includes sample models and configurations)",
    );
    expect(plain(configurator.fr.kit(projectPriceNow("configurator", oct1)))).toBe(
      "Une version de ce configurateur 3D pour votre propre site (12 800 ¥, achat unique ; modèles et configurations d’exemple inclus)",
    );
    // SaaS スターターと業務アプリの頭の値段は KitPriceLine（kit-demos.ts）に移した（2026-10-15）
    for (const lang of ["ja", "en", "fr"] as const) {
      expect(configurator[lang].kit(projectPriceNow("configurator", oct1))).not.toMatch(/発売記念|launch price|prix de lancement/);
    }
  });
});
