"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_LINKS } from "./nav";
import s from "./corporate-parts.module.css";

/**
 * 共通ヘッダーの 4 リンク。いま開いている面に aria-current を付ける。
 * 現在地を知るのに usePathname が要るので、ここだけクライアント部品にする
 * （枠の layout.tsx はサーバー部品のまま）。
 */
export function CorporateNav() {
  const pathname = usePathname();

  return (
    <nav className={s.nav} aria-label="サイト内">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={s.navLink}
          aria-current={pathname === link.href ? "page" : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
