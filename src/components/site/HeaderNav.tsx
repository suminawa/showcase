"use client";
/*
 * 頭の案内。いまいるページの項目にだけ aria-current と朱の下線（選ばれている印）を付ける。
 *
 *   - 道そのもの（/contact など）は、いまの道と同じなら選ばれている
 *   - 節への道（/kits#ai）は、/kits にいて、しかも節の印（hash）が同じときだけ。印は読み込みのあとに見るので、
 *     サーバーの出力と最初の描画は同じ（印の分だけあとで下線が付く。位置は動かない）
 *   - matches に書かれた道（その柱の品物のページ）にいるあいだも選ばれている
 *   - /kits（スマホの「キット」）は、品物のページ（/projects/…）にいるあいだも選ばれている
 *
 * show は幅で出し分ける印: wide は PC（1024px 以上）だけ、narrow はそれ未満だけ。CSS が片方を display: none にする。
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import s from "./site-header.module.css";

export type NavItem = {
  href: string;
  label: string;
  hrefLang?: string;
  show?: "wide" | "narrow";
  /** この項目を選んでいる扱いにする、ほかの道（その柱の品物のページ） */
  matches?: readonly string[];
};

function split(href: string): { path: string; frag: string } {
  const at = href.indexOf("#");
  return at < 0 ? { path: href, frag: "" } : { path: href.slice(0, at), frag: href.slice(at) };
}

function isCurrent(pathname: string, hash: string, item: NavItem): boolean {
  if (item.matches?.includes(pathname)) return true;
  const { path, frag } = split(item.href);
  if (frag) return pathname === path && hash === frag;
  if (pathname === path) return true;
  // 品物のページ（/projects/…・/en/projects/…）にいるあいだは「キット」を選んでいる
  if (path.endsWith("/kits")) return pathname.startsWith(`${path.slice(0, -"kits".length)}projects/`);
  return false;
}

export function HeaderNav({ label, items }: { label: string; items: NavItem[] }) {
  const pathname = usePathname() ?? "";
  const [hash, setHash] = useState("");

  useEffect(() => {
    const read = () => setHash(window.location.hash);
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [pathname]);

  return (
    <nav className={s.nav} aria-label={label}>
      <ul className={s.list}>
        {items.map((item) => {
          const current = isCurrent(pathname, hash, item);
          const { frag } = split(item.href);
          return (
            <li key={item.href} className={item.show === "wide" ? s.wide : item.show === "narrow" ? s.narrow : undefined}>
              <Link
                href={item.href}
                hrefLang={item.hrefLang}
                className={s.item}
                aria-current={current ? "page" : undefined}
                // 同じページの中で節へ飛ぶときは hashchange が来ないことがあるので、押した時点で印を持つ
                onClick={frag ? () => setHash(frag) : undefined}
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
