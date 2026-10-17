/*
 * どのページにも置く頭（根の文書 RootDocument に 1 か所）。見本サイト（/demos）では出さない（globals.css）。
 * 落款と名乗り・キット・頼み方と料金・運営者、PC だけ右に「相談する」。いまいるページの項目は朱の下線（HeaderNav）。
 * 本文へ飛ぶ一行を、頭の最初に置く（Tab の一回目）。
 */
import Link from "next/link";

import { hrefFor, type Lang } from "@/i18n/routes";

import { HeaderNav, type NavItem } from "./HeaderNav";
import s from "./site-header.module.css";

const T: Record<Lang, { home: string; label: string; skip: string; cta: string; items: NavItem[] }> = {
  ja: {
    home: "suminawa のトップへ",
    label: "サイトの案内",
    skip: "本文へ",
    cta: "相談する",
    items: [
      { href: "/kits", label: "キット" },
      { href: "/contact", label: "頼み方と料金" },
      { href: "/about", label: "運営者" },
    ],
  },
  en: {
    home: "suminawa home",
    label: "Site",
    skip: "Skip to content",
    cta: "Contact",
    items: [
      { href: "/en/kits", label: "Kits" },
      { href: "/en/contact", label: "Pricing" },
      { href: "/about", label: "About (JA)", hrefLang: "ja" },
    ],
  },
  fr: {
    home: "Accueil suminawa",
    label: "Site",
    skip: "Aller au contenu",
    cta: "Contact",
    items: [
      { href: "/fr/kits", label: "Kits" },
      { href: "/fr/contact", label: "Tarifs" },
      { href: "/about", label: "À propos (JA)", hrefLang: "ja" },
    ],
  },
};

export function SiteHeader({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <header className={s.header} data-site-header>
      <a href="#main" className={s.skip}>
        {t.skip}
      </a>
      <div className={s.inner}>
        <Link href={hrefFor(lang, "/")} className={s.brand} aria-label={t.home}>
          <span className={s.seal} aria-hidden="true">
            墨
          </span>
          <span className={s.word}>suminawa</span>
        </Link>
        <HeaderNav label={t.label} items={t.items} />
        <Link href={hrefFor(lang, "/contact")} className={s.cta}>
          {t.cta}
        </Link>
      </div>
    </header>
  );
}
