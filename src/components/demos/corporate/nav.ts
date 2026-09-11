/**
 * 見本「潮見計測」の共通ヘッダーの 4 リンク。並びもこの配列の順。
 * ここが唯一の出どころ ── 面を足したらこの配列と、対応する page.tsx の両方を直す。
 */
export const NAV_BASE = "/demos/corporate-site";

export type NavLink = { href: string; label: string };

export const NAV_LINKS: readonly NavLink[] = [
  { href: NAV_BASE, label: "ホーム" },
  { href: `${NAV_BASE}/services`, label: "事業内容" },
  { href: `${NAV_BASE}/company`, label: "会社概要" },
  { href: `${NAV_BASE}/contact`, label: "お問い合わせ" },
];
