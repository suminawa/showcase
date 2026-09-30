/*
 * 右上の言語の切り替え。「日本語 / English / Français」。
 * 行き先は同じ紙の別の言語の道に ?hl= を付けたもの ── proxy が Cookie に覚えてから、
 * クエリの無い道へ送り直す（JS が無くても動く）。?hl= の道は巡回させない（rel="nofollow"。各言語の道は hreflang で渡す）。今の言語は印だけで、リンクにしない。
 * 朱は使わない（朱は落款ひとつ）。墨の濃淡だけで今の言語を示す。
 */
import { LANGS, LANG_QUERY, localePath, type Lang } from "@/i18n/routes";
import { UI } from "@/i18n/ui";

import s from "./lang-switch.module.css";

const NAMES: Record<Lang, string> = { ja: "日本語", en: "English", fr: "Français" };

export function LangSwitch({ lang, path }: { lang: Lang; path: string }) {
  return (
    <nav className={s.switch} aria-label={UI[lang].languages}>
      {LANGS.map((l, i) => (
        <span key={l} className={s.item}>
          {i > 0 && (
            <span className={s.sep} aria-hidden="true">
              /
            </span>
          )}
          {l === lang ? (
            <span className={s.current} aria-current="true" lang={l}>
              {NAMES[l]}
            </span>
          ) : (
            <a className={s.link} href={`${localePath(l, path)}?${LANG_QUERY}=${l}`} hrefLang={l} lang={l} rel="nofollow">
              {NAMES[l]}
            </a>
          )}
        </span>
      ))}
    </nav>
  );
}
