/*
 * 頼み方と料金（/contact）。頭（題・一行・宛先）→ 頼み方と目安 → 進め方 → よくあるご質問 → フォーム → ほかの場所。
 * 宛先は頭のすぐ下に置く（スマホで最後まで読まないと送り先が分からなかった。2026-10-17 デザインの見直し 2）。
 *
 * 数字の出どころは公開済みの受託メニュー（concierge/content/services.md）と PRICE_LADDER ひとつで、
 * そこに書いていない額は足さない。日本語の紙にだけ、頼み方の階段とよくあるご質問を置く。
 * 問い合わせのフォームは、自社のフォーム受付キットを持ち主のアカウントで公開してから（NEXT_PUBLIC_CONTACT_ENDPOINT）。
 * FORM: 方眼（DESIGN.md）
 */
import { PriceLadder } from "@/components/site/PriceLadder";
import u from "@/components/site/ui.module.css";
import { ContactMail } from "@/components/track/ContactMail";
import { localContact } from "@/i18n/catalog";
import { pageMetadata } from "@/i18n/meta";
import type { Lang } from "@/i18n/routes";
import { CONTACT_FAQ, ELSEWHERE, EMBED_SERVICE } from "@/lib/projects";

import { ContactForm } from "./ContactForm";
import c from "./contact.module.css";

const T: Record<
  Lang,
  { mailHead: string; mailNote: string; services: string; steps: string; elsewhere: string; elsewhereNote: string }
> = {
  ja: {
    mailHead: "メールで相談する",
    mailNote: "3 営業日以内に返信します。ココナラ・ランサーズ・クラウドワークスを通してのご依頼もお受けします。",
    services: "頼めること",
    steps: "進め方",
    elsewhere: "ほかの場所",
    elsewhereNote: "suminawa の名義のアカウントです。",
  },
  en: {
    mailHead: "Write to me",
    mailNote: "Replies within 3 business days.",
    services: "Services",
    steps: "How it works",
    elsewhere: "Elsewhere",
    elsewhereNote: "Other places under the suminawa name.",
  },
  fr: {
    mailHead: "Écrire",
    mailNote: "Réponse sous 3 jours ouvrés.",
    services: "Prestations",
    steps: "Déroulement",
    elsewhere: "Ailleurs",
    elsewhereNote: "Les autres lieux sous le nom suminawa.",
  },
};

export function contactMetadata(lang: Lang) {
  const { page } = localContact(lang);
  return pageMetadata(lang, "/contact", { title: page.title, description: page.lede, image: "/og/contact.png" });
}

export function ContactPage({ lang }: { lang: Lang }) {
  const endpoint = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;
  const { page, services, steps } = localContact(lang);
  const t = T[lang];
  return (
    <main id="main" className={c.page}>
      <div className={u.wrap}>
        <header className={c.head}>
          <div className={c.headMain}>
            <h1 className={c.title}>{page.title}</h1>
            <p className={u.lede}>{page.lede}</p>
          </div>
          <div className={c.mailBox}>
            <p className={c.mailHead}>{t.mailHead}</p>
            <p className={c.mail}>
              <ContactMail className={c.mailLink} />
            </p>
            <p className={u.small}>{t.mailNote}</p>
            {lang === "ja" && endpoint && (
              <p className={u.small}>
                <a href="#form" className={u.link}>
                  フォームでも送れます
                </a>
              </p>
            )}
          </div>
        </header>

        {lang === "ja" ? (
          <section className={c.section} id="ladder" aria-labelledby="ladder-title">
            <h2 id="ladder-title" className={u.h2}>
              頼み方と目安
            </h2>
            <PriceLadder />
            <p className={c.after}>
              {EMBED_SERVICE.title}は、{EMBED_SERVICE.price}（税別）です。
            </p>
          </section>
        ) : (
          <section className={c.section} aria-labelledby="services-title">
            <h2 id="services-title" className={u.h2}>
              {t.services}
            </h2>
            <ul className={c.menu}>
              {services.map((item) => (
                <li key={item.title} className={c.menuItem}>
                  <span className={c.menuName}>{item.title}</span>
                  <span className={c.menuPrice}>{item.price}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={c.section} aria-labelledby="steps-title">
          <h2 id="steps-title" className={u.h2}>
            {t.steps}
          </h2>
          <ol className={c.steps}>
            {steps.map((step, i) => (
              <li key={step.title} className={c.step}>
                <span className={c.stepNo} aria-hidden="true">
                  {i + 1}
                </span>
                <span className={c.stepName}>{step.title}</span>
                <span className={c.stepDetail}>{step.detail}</span>
              </li>
            ))}
          </ol>
        </section>

        {lang === "ja" && (
          <section className={c.section} id="faq" aria-labelledby="faq-title">
            <h2 id="faq-title" className={u.h2}>
              よくあるご質問
            </h2>
            <dl className={c.faq}>
              {CONTACT_FAQ.map((item) => (
                <div key={item.q} className={c.qa}>
                  <dt>{item.q}</dt>
                  <dd>{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* 問い合わせのフォーム（自社の「フォーム受付 GAS キット」）。送信先の URL は持ち主のアカウントで公開した
            ウェブアプリで、環境変数 NEXT_PUBLIC_CONTACT_ENDPOINT に入る。無いあいだはこの節を出さず、上の宛先だけ */}
        {lang === "ja" && endpoint && (
          <section className={c.section} id="form" aria-labelledby="form-title">
            <h2 id="form-title" className={u.h2}>
              フォームで送る
            </h2>
            <div className={c.formBox}>
              <ContactForm endpoint={endpoint} />
            </div>
          </section>
        )}

        <section className={c.section} aria-labelledby="elsewhere-title">
          <h2 id="elsewhere-title" className={u.h2}>
            {t.elsewhere}
          </h2>
          <p className={u.small}>{t.elsewhereNote}</p>
          <ul className={c.elsewhere}>
            {ELSEWHERE.map((e) => (
              <li key={e.name}>
                <a className={c.elsewhereLink} href={e.href} rel="me noopener">
                  {e.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
