/*
 * 制作のご相談。トップの結びから来る紙で、頼めることと料金の目安、進め方、宛先だけ。
 *
 * 数字の出どころは公開済みの受託メニュー（concierge/content/services.md）ひとつで、
 * そこに書いていない額は足さない。肩書き・経歴・実績の数は書かない ──
 * ここに置くのは品書きだけで、語るのは分類のページに並ぶ実物のほうである。
 * フォームは置かない（メールアドレスを集めない）。
 * FORM: 料紙（分類のページ）— 文法は DESIGN.md
 */
import Link from "next/link";

import { Sheet, SheetSection } from "@/components/ryoushi";
import { localContact } from "@/i18n/catalog";
import { pageMetadata } from "@/i18n/meta";
import { hrefFor, type Lang } from "@/i18n/routes";
import { ELSEWHERE } from "@/lib/projects";
import { UI } from "@/i18n/ui";

import s from "../ryoushi.module.css";

/** 段の名。品書きと進め方の数字・文は src/i18n/catalog.ts（日本語は projects.ts） */
const HEADS: Record<Lang, { services: string; steps: string }> = {
  ja: { services: "頼めること", steps: "進め方" },
  en: { services: "Services", steps: "How it works" },
  fr: { services: "Prestations", steps: "Déroulement" },
};

/** ほかの置き場の行の頭（サービス名は訳さない） */
const ELSEWHERE_HEAD: Record<Lang, string> = { ja: "ほかの場所: ", en: "Elsewhere: ", fr: "Ailleurs : " };

export function contactMetadata(lang: Lang) {
  const { page } = localContact(lang);
  return pageMetadata(lang, "/contact", { title: page.title, description: page.lede, image: "/og/contact.png" });
}

export function ContactPage({ lang }: { lang: Lang }) {
  const { page, services, steps, note } = localContact(lang);
  return (
    <Sheet title={page.title} latin={page.latin} lede={page.lede} lang={lang} path="/contact">
      {/* 品書き。題と目安が同じ罫に並ぶ ── 献立表と同じ組み方で、
          行そのものは何処へも飛ばない（触れても濡れない） */}
      {/*
        頼めることと進め方を【一つの段】に組む。
        段を二つに割ると、あいだに罫 6 本（版面の張り出しの和）が要る ──
        中身が 4 行と 3 行しかない紙では、その空白のほうが字より長くなり、
        書きかけの紙に見えた。一つの段なら小見出しを罫 2 本で継げる。
      */}
      <SheetSection name={HEADS[lang].services}>
        <ul className={s.menu}>
          {services.map((item) => (
            <li key={item.title} className={s.menuItem}>
              <span className={s.menuName}>{item.title}</span>
              <span className={s.menuPrice}>{item.price}</span>
            </li>
          ))}
        </ul>

        <h2 className={`${s.shelfName} ${s.subHead}`}>{HEADS[lang].steps}</h2>
        <ol className={s.steps}>
          {steps.map((step) => (
            <li key={step.title} className={s.step}>
              <span className={s.stepName}>{step.title}</span>
              <span className={s.stepDetail}>{step.detail}</span>
            </li>
          ))}
        </ol>
      </SheetSection>

      <footer className={s.close}>
        <p className={s.menuNote}>
          {note.before}
          <a className={s.mailLink} href={`mailto:${note.mail}`}>
            {note.mail}
          </a>
          {note.after}
        </p>
        {/* ほかの置き場。宛先と同じ小さな字で一行だけ ── 品書きより前に出さない */}
        <p className={s.menuNote} style={{ marginTop: 0 }}>
          {ELSEWHERE_HEAD[lang]}
          {ELSEWHERE.map((e, i) => (
            <span key={e.name}>
              {i > 0 ? " ・ " : ""}
              <a className={s.mailLink} href={e.href} rel="me noopener">
                {e.name}
              </a>
            </span>
          ))}
        </p>
        {/* 入口へ帰る一行。頭の戻りと同じ行き先だが、下まで読んだ人が
            巻き戻さずに済むように置く。落款は頭に一つだけで、ここには捺さない */}
        <p className={s.closeLinks}>
          <Link href={hrefFor(lang, "/")} className={s.contact}>
            {UI[lang].back}
          </Link>
        </p>
      </footer>
    </Sheet>
  );
}
