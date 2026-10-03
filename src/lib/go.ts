/*
 * 売り場（note・BOOTH）へ出る道。紙の上のリンクは直に外へ出さず、/go/<key>/<dest> を通す。
 * /go/ は links.json にある URL へだけ 302 で渡し、押された回数を 1 行の記録に残す
 * （IP・Cookie・UA は持たない。src/app/go/[key]/[dest]/route.ts）。
 *
 * from はそのリンクが置かれている紙の道。記録のときに既知の道と照らし、知らない値は "unknown" になる。
 */
import links from "../data/links.json";

export type GoDest = "note" | "booth";
export type LinkKey = keyof typeof links;

const DESTS: readonly string[] = ["note", "booth"];
const table = links as Record<string, { note?: string; booth?: string }>;

/** 売り場へ出る道。from を渡すと ?from= が付く */
export function goHref(key: LinkKey, dest: GoDest, from?: string): string {
  const path = `/go/${encodeURIComponent(key)}/${dest}`;
  return from ? withFrom(path, from) : path;
}

/** /go/ の道かどうか。紙の中の道（next/link）と分けて、外へ出る a で描くために使う */
export function isGoHref(href: string): boolean {
  return href.startsWith("/go/");
}

/** 既にある /go/ の道に、置かれている紙の道を添える */
export function withFrom(href: string, from: string): string {
  return `${href}?from=${encodeURIComponent(from)}`;
}

/**
 * key と dest から渡し先を引く。links.json に無い・空の URL・https 以外は null。
 * URL は links.json からしか取らない（問い合わせの文字列から先を決めない）。
 */
export function resolveGo(key: string, dest: string): string | null {
  if (!DESTS.includes(dest)) return null;
  if (!Object.prototype.hasOwnProperty.call(table, key)) return null;
  const url = table[key][dest as GoDest];
  if (typeof url !== "string" || !url.startsWith("https://")) return null;
  return url;
}

/**
 * 英仏の紙（/en・/fr）から BOOTH へ出るときは、BOOTH の英語の画面へ渡す（BOOTH に仏語の画面は無い）。
 * ショップの道（https://suminawa.booth.pm/items/<番号>）だけを https://booth.pm/en/items/<番号> に替え、ほかは触らない。
 */
export function localizeBooth(url: string, from: string): string {
  if (!/^\/(en|fr)(\/|$)/.test(from)) return url;
  const m = /^https:\/\/suminawa\.booth\.pm\/items\/(\d+)$/.exec(url);
  return m ? `https://booth.pm/en/items/${m[1]}` : url;
}
