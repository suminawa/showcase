"use client";
/*
 * 頭の案内。いまいるページの項目にだけ aria-current と朱の下線（選ばれている印）を付ける。
 * /kits の下（品物のページ）にいるあいだは「キット」を選んでいる扱いにする。
 */
import Link from "next/link";
import { usePathname } from "next/navigation";

import s from "./site-header.module.css";

export type NavItem = { href: string; label: string; hrefLang?: string };

function isCurrent(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  // 品物のページ（/projects/…・/en/projects/…）にいるあいだは「キット」を選んでいる
  if (href.endsWith("/kits")) return pathname.startsWith(`${href.slice(0, -"kits".length)}projects/`);
  return false;
}

export function HeaderNav({ label, items }: { label: string; items: NavItem[] }) {
  const pathname = usePathname() ?? "";
  return (
    <nav className={s.nav} aria-label={label}>
      <ul className={s.list}>
        {items.map((item) => {
          const current = isCurrent(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                hrefLang={item.hrefLang}
                className={s.item}
                aria-current={current ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
