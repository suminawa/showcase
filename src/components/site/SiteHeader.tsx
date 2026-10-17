/*
 * どのページにも置く頭（根の文書 RootDocument に 1 か所）。見本サイト（/demos）では出さない（globals.css）。
 * 落款と名乗り、案内、PC だけ右に「相談する」。いまいるページの項目は朱の下線（HeaderNav）。
 *
 * 案内は三つの柱（業務自動化・AI活用・Web制作。2026-10-17、持ち主の指示）で、/kits の三つの棚（#automation・#ai・#web）へ飛ぶ。
 * スマホの幅（1024px 未満）では三つが入らないので、「キット」の一つにまとめて /kits の頭の目次へ渡す。
 * 品物のページにいるあいだは、その品物の柱（スマホでは「キット」）を選んでいる扱いにする。
 * 本文へ飛ぶ一行を、頭の最初に置く（Tab の一回目）。
 */
import Link from "next/link";

import { hrefFor, type Lang } from "@/i18n/routes";
import { PILLARS, pillarKits, projectHref, type PillarId } from "@/lib/projects";

import { HeaderNav, type NavItem } from "./HeaderNav";
import s from "./site-header.module.css";

const T: Record<
  Lang,
  { home: string; label: string; skip: string; cta: string; pillars: Record<PillarId, string>; kits: string; items: NavItem[] }
> = {
  ja: {
    home: "suminawa のトップへ",
    label: "サイトの案内",
    skip: "本文へ",
    cta: "相談する",
    pillars: { automation: "業務自動化", ai: "AI活用", web: "Web制作" },
    kits: "キット",
    items: [
      { href: "/contact", label: "頼み方と料金" },
      { href: "/about", label: "運営者" },
    ],
  },
  en: {
    home: "suminawa home",
    label: "Site",
    skip: "Skip to content",
    cta: "Contact",
    pillars: { automation: "Automation", ai: "AI", web: "Web" },
    kits: "Kits",
    items: [
      { href: "/en/contact", label: "Pricing" },
      { href: "/about", label: "About (JA)", hrefLang: "ja" },
    ],
  },
  fr: {
    home: "Accueil suminawa",
    label: "Site",
    skip: "Aller au contenu",
    cta: "Contact",
    pillars: { automation: "Automatisation", ai: "IA", web: "Web" },
    kits: "Kits",
    items: [
      { href: "/fr/contact", label: "Tarifs" },
      { href: "/about", label: "À propos (JA)", hrefLang: "ja" },
    ],
  },
};

/** 案内の項目。PC は三つの柱、スマホは「キット」の一つ。そのあとに頼み方と料金・運営者 */
function navItems(lang: Lang): NavItem[] {
  const t = T[lang];
  const kits = hrefFor(lang, "/kits");
  return [
    ...PILLARS.map((pillar) => ({
      href: `${kits}#${pillar.id}`,
      label: t.pillars[pillar.id],
      show: "wide" as const,
      // その柱の品物のページにいるあいだは、この柱を選んでいる
      matches: pillarKits(pillar).map((kit) => hrefFor(lang, projectHref(kit))),
    })),
    { href: kits, label: t.kits, show: "narrow" as const },
    ...t.items,
  ];
}

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
        <HeaderNav label={t.label} items={navItems(lang)} />
        <Link href={hrefFor(lang, "/contact")} className={s.cta}>
          {t.cta}
        </Link>
      </div>
    </header>
  );
}
