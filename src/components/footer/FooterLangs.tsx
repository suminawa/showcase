"use client";
/*
 * フッターの言語の切り替え。いまの紙の道から、ほかの言語の同じ紙へ（訳の無い紙はその言語のトップへ）。
 * 行き先には ?hl= を付ける ── proxy が Cookie に覚えてから、クエリの無い道へ送り直す（JS が無くても動く）。
 */
import { usePathname } from "next/navigation";

import { LANGS, LANG_QUERY, isTranslated, localePath, splitLang } from "@/i18n/routes";

import s from "./site-footer.module.css";

const NAMES = { ja: "日本語", en: "English", fr: "Français" } as const;

export function FooterLangs({ label }: { label: string }) {
  const { lang, path } = splitLang(usePathname() ?? "/");
  const base = isTranslated(path) ? path : "/";
  return (
    <nav className={s.langs} aria-label={label}>
      <ul className={s.langList}>
        {LANGS.map((l) => (
          <li key={l}>
            {l === lang ? (
              <span className={s.langCurrent} aria-current="true" lang={l}>
                {NAMES[l]}
              </span>
            ) : (
              <a className={s.link} href={`${localePath(l, base)}?${LANG_QUERY}=${l}`} hrefLang={l} lang={l} rel="nofollow">
                {NAMES[l]}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
