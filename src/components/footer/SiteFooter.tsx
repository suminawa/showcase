/*
 * どのページにも置くフッター（根の文書 RootDocument に 1 か所。見本サイトにも出す）。
 * 墨の面に、名乗りの一行・宛先・キット・ご相談・このサイト・ほかの場所、言語の切り替え。
 * 運営者・悩みから読むは日本語の紙だけなので、英仏の紙からは hrefLang="ja" で渡す。
 */
import Link from "next/link";

import { ContactMail } from "@/components/track/ContactMail";
import { hrefFor, type Lang } from "@/i18n/routes";
import { ELSEWHERE } from "@/lib/projects";

import { FooterLangs } from "./FooterLangs";
import s from "./site-footer.module.css";

type Item = { href: string; label: string; jaOnly?: boolean };
type Column = { head: string; items: Item[] };

const T: Record<Lang, { line: string; reply: string; label: string; elsewhere: string; columns: Column[]; langs: string }> = {
  ja: {
    line: "Google スプレッドシートで動く、買い切りの事務の道具。",
    reply: "3 営業日以内に返信します。",
    label: "フッターの案内",
    elsewhere: "ほかの場所",
    langs: "言語",
    columns: [
      {
        head: "キット",
        items: [
          { href: "/projects/deadline", label: "期限アラート" },
          { href: "/projects/form", label: "フォーム受付" },
          { href: "/projects/booking", label: "予約ページ" },
          { href: "/kits", label: "キットの一覧" },
        ],
      },
      {
        head: "ご相談",
        items: [
          { href: "/contact", label: "頼み方と料金" },
          { href: "/contact#faq", label: "よくあるご質問" },
        ],
      },
      {
        head: "このサイト",
        items: [
          { href: "/about", label: "運営者について", jaOnly: true },
          { href: "/guides", label: "悩みから読む", jaOnly: true },
          { href: "/sites", label: "見本サイト" },
          { href: "/works", label: "作品と道具" },
        ],
      },
    ],
  },
  en: {
    line: "One-time-purchase office tools that run in Google Sheets.",
    reply: "Replies within 3 business days.",
    label: "Footer",
    elsewhere: "Elsewhere",
    langs: "Language",
    columns: [
      {
        head: "Kits",
        items: [
          { href: "/projects/deadline", label: "Deadline Alert" },
          { href: "/projects/form", label: "Form Intake" },
          { href: "/projects/booking", label: "Booking Page" },
          { href: "/kits", label: "All kits" },
        ],
      },
      { head: "Work with me", items: [{ href: "/contact", label: "Pricing and contact" }] },
      {
        head: "This site",
        items: [
          { href: "/about", label: "About (Japanese)", jaOnly: true },
          { href: "/guides", label: "Guides (Japanese)", jaOnly: true },
          { href: "/sites", label: "Sample sites" },
          { href: "/works", label: "Works and tools" },
        ],
      },
    ],
  },
  fr: {
    line: "Des outils de bureau en achat unique, qui fonctionnent dans Google Sheets.",
    reply: "Réponse sous 3 jours ouvrés.",
    label: "Pied de page",
    elsewhere: "Ailleurs",
    langs: "Langue",
    columns: [
      {
        head: "Kits",
        items: [
          { href: "/projects/deadline", label: "Alertes d’échéances" },
          { href: "/projects/form", label: "Réception de formulaires" },
          { href: "/projects/booking", label: "Page de réservation" },
          { href: "/kits", label: "Tous les kits" },
        ],
      },
      { head: "Travailler ensemble", items: [{ href: "/contact", label: "Tarifs et contact" }] },
      {
        head: "Ce site",
        items: [
          { href: "/about", label: "À propos (en japonais)", jaOnly: true },
          { href: "/guides", label: "Guides (en japonais)", jaOnly: true },
          { href: "/sites", label: "Sites d’exemple" },
          { href: "/works", label: "Réalisations et outils" },
        ],
      },
    ],
  },
};

export function SiteFooter({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div className={s.brand}>
          <p className={s.mark}>
            <span className={s.seal} aria-hidden="true">
              墨
            </span>
            suminawa
          </p>
          <p className={s.line}>{t.line}</p>
          <p className={s.mail}>
            <ContactMail className={s.link} />
            <span className={s.reply}>{t.reply}</span>
          </p>
        </div>

        <nav className={s.columns} aria-label={t.label}>
          {t.columns.map((col) => (
            <div key={col.head} className={s.column}>
              <h2 className={s.head}>{col.head}</h2>
              <ul className={s.list}>
                {col.items.map((item) => (
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
            </div>
          ))}
          <div className={s.column}>
            <h2 className={s.head}>{t.elsewhere}</h2>
            <ul className={s.list}>
              {ELSEWHERE.map((e) => (
                <li key={e.name}>
                  <a className={s.link} href={e.href} rel="me noopener">
                    {e.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className={s.base}>
          <FooterLangs label={t.langs} />
          <p className={s.copy}>© 2026 suminawa</p>
        </div>
      </div>
    </footer>
  );
}
