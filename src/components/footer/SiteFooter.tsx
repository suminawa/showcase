/*
 * どの紙の下にも置く共通の一行（2026-10-15 監査 改善 2）。根の文書（RootDocument）に 1 か所だけ置くので、
 * 作品ページ・一覧・guides・見本サイト・/about のどれにも同じ道が出る。
 * 悩みから読む と 運営者について は日本語の紙だけなので、英仏の紙からは hrefLang="ja" で渡す。
 */
import Link from "next/link";

import { hrefFor, type Lang } from "@/i18n/routes";

import s from "./site-footer.module.css";

type Item = { href: string; label: string; jaOnly?: boolean };

const ITEMS: Record<Lang, Item[]> = {
  ja: [
    { href: "/kits", label: "キット" },
    { href: "/guides", label: "悩みから読む", jaOnly: true },
    { href: "/sites", label: "見本サイト" },
    { href: "/contact", label: "制作のご相談" },
    { href: "/about", label: "運営者について", jaOnly: true },
  ],
  en: [
    { href: "/kits", label: "Kits" },
    { href: "/guides", label: "Guides (Japanese)", jaOnly: true },
    { href: "/sites", label: "Sample sites" },
    { href: "/contact", label: "Contact" },
    { href: "/about", label: "About (Japanese)", jaOnly: true },
  ],
  fr: [
    { href: "/kits", label: "Kits" },
    { href: "/guides", label: "Guides (en japonais)", jaOnly: true },
    { href: "/sites", label: "Sites d’exemple" },
    { href: "/contact", label: "Contact" },
    { href: "/about", label: "À propos (en japonais)", jaOnly: true },
  ],
};

const LABEL: Record<Lang, string> = { ja: "サイトの案内", en: "Site", fr: "Site" };

export function SiteFooter({ lang }: { lang: Lang }) {
  return (
    <footer className={s.footer}>
      <nav aria-label={LABEL[lang]}>
        <ul className={s.list}>
          {ITEMS[lang].map((item) => (
            <li key={item.href}>
              <Link
                href={item.jaOnly ? item.href : hrefFor(lang, item.href)}
                hrefLang={item.jaOnly && lang !== "ja" ? "ja" : undefined}
                className={s.link}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
