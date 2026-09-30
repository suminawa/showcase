/*
 * 言語と道。訳のある紙の一覧はここ一か所で、proxy・hreflang・sitemap・テストが読む。
 *
 * 日本語は今の道のまま（接頭辞なし）。英語と仏語は /en・/fr を頭に付ける。
 * 見本サイト（/demos）と悩みから読む紙（/guides）は日本語だけで、ここには載せない。
 */
export const LANGS = ["ja", "en", "fr"] as const;
export type Lang = (typeof LANGS)[number];
export type ForeignLang = Exclude<Lang, "ja">;
export const FOREIGN_LANGS: readonly ForeignLang[] = ["en", "fr"];

/** 切り替えで選んだ言語を覚える Cookie と、切り替えのリンクに付けるクエリ */
export const LANG_COOKIE = "lang";
export const LANG_QUERY = "hl";

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

export function isForeignLang(value: unknown): value is ForeignLang {
  return value === "en" || value === "fr";
}

/** 訳のある作品ページ（src/app/projects/<slug> と src/app/[lang]/projects/<slug> の両方にある） */
export const TRANSLATED_PROJECTS = [
  "30days",
  "ai-concierge",
  "booking",
  "configurator",
  "dashboard",
  "deadline",
  "doc-reader",
  "floorplan",
  "form",
  "inbox-triage",
  "mcp-server",
  "quote-simulator",
  "saas-starter",
  "sheet-app",
  "suminagashi",
  "tax-back",
] as const;

export const TRANSLATED_PATHS: readonly string[] = [
  "/",
  "/works",
  "/kits",
  "/sites",
  "/contact",
  ...TRANSLATED_PROJECTS.map((slug) => `/projects/${slug}`),
];

const TRANSLATED = new Set(TRANSLATED_PATHS);

export function isTranslated(path: string): boolean {
  return TRANSLATED.has(path);
}

/** その言語の道。日本語は道のまま、英仏は /en・/fr を頭に付ける（トップは /en） */
export function localePath(lang: Lang, path: string): string {
  if (lang === "ja") return path;
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

/** 道から言語を外す。「/en/kits」→ en と「/kits」、「/kits」→ ja と「/kits」 */
export function splitLang(pathname: string): { lang: Lang; path: string } {
  const m = /^\/(en|fr)(\/.*)?$/.exec(pathname);
  if (!m) return { lang: "ja", path: pathname };
  return { lang: m[1] as ForeignLang, path: m[2] ?? "/" };
}

/**
 * 紙の中のリンク。訳のある紙へはその言語の道に、訳の無い紙（見本・guides・/go/・外）へはそのまま。
 * 「/projects/configurator#shopify」のような節への道も扱う。
 */
export function hrefFor(lang: Lang, href: string): string {
  const at = href.search(/[?#]/);
  const path = at < 0 ? href : href.slice(0, at);
  const rest = at < 0 ? "" : href.slice(at);
  return isTranslated(path) ? localePath(lang, path) + rest : href;
}
