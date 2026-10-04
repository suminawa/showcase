"use client";

/**
 * 法務の 1 枚です（特定商取引法に基づく表記）。手本はキットの app/legal/_document.tsx です。
 *
 * 文面は素のテキストのまま持ち、段落の並びに読み替えてから React の要素に写します。
 * **HTML の文字列は、どこでも組み立てません。**
 *
 * 見本では、差し込む値のうち 2 つをわざと空にしてあります。
 * お書き忘れの項目が「（未記入）」と出て、ページの上に帯が立つところを、
 * 実際にご覧いただくためです。
 */
import type { ReactNode } from "react";

import { LEGAL_TEXT } from "../kit/legal-text";
import { LEGAL } from "../kit/legal.config";
import { formatDate, t, type Lang, type Messages } from "../kit/src/core/i18n";
import {
  missingLegalKeys,
  parseLegal,
  type LegalBlock,
  type LegalConfig,
} from "../kit/src/core/legal";
import styles from "./legal.module.css";
import ui from "./ui.module.css";

/** 見本でわざと空にしておく項目です（帯が立つところをご覧いただくためです） */
const DEMO_LEGAL: LegalConfig = { ...LEGAL, phone: "", contactHours: "" };

function Block({ block }: { block: LegalBlock }): ReactNode {
  switch (block.kind) {
    case "h2":
      return <h2 className={styles.heading}>{block.text}</h2>;
    case "ul":
      return (
        <ul className={styles.list}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "dl":
      return (
        <dl className={styles.rows}>
          {block.rows.map((row) => (
            <div className={styles.row} key={row.term}>
              <dt className={styles.rowTerm}>{row.term}</dt>
              <dd className={styles.rowText}>{row.text}</dd>
            </div>
          ))}
        </dl>
      );
    default:
      return <p className={styles.paragraph}>{block.text}</p>;
  }
}

export function LegalScreen({
  lang,
  messages,
  onBack,
}: {
  lang: Lang;
  messages: Messages;
  onBack: () => void;
}): ReactNode {
  const source = LEGAL_TEXT[`tokushoho.${lang}`] ?? "";
  const blocks = parseLegal(source, DEMO_LEGAL, { blank: t(messages, "legal.blank") });
  const missing = missingLegalKeys(DEMO_LEGAL);
  const updated = formatDate(DEMO_LEGAL.updatedOn, lang);

  return (
    <div className={styles.page}>
      <header className={`${styles.inner} ${styles.header}`}>
        <button type="button" className={styles.brand} onClick={onBack}>
          {t(messages, "common.appName")}
        </button>
        <nav className={styles.nav} aria-label={t(messages, "legal.navLabel")}>
          <span className={styles.navHere} aria-current="page">
            {t(messages, "legal.tokushoho.title")}
          </span>
        </nav>
      </header>

      <main className={`${styles.inner} ${styles.main}`}>
        <h1 className={styles.title}>{t(messages, "legal.tokushoho.title")}</h1>
        <p className={styles.updated}>
          {t(messages, "legal.updatedOn", {
            date: updated === "" ? t(messages, "legal.blank") : updated,
          })}
        </p>

        {missing.length > 0 ? (
          <aside className={styles.notice}>
            <p className={styles.noticeTitle}>{t(messages, "legal.missingTitle")}</p>
            <p className={styles.noticeText}>
              {t(messages, "legal.missingHint", { count: missing.length })}
            </p>
          </aside>
        ) : null}

        <article className={styles.doc}>
          {blocks.map((block, index) => (
            // 文面の並びは書き換えるまで変わらないので、順番を鍵にします
            <Block block={block} key={`${block.kind}-${index}`} />
          ))}
        </article>
      </main>

      <footer className={`${styles.inner} ${styles.footer} ${ui.stackTight}`}>
        <p className={ui.hint}>{t(messages, "demo.legal.note")}</p>
        <p className={ui.hint}>{t(messages, "demo.legal.only")}</p>
        <div className={ui.row}>
          <button type="button" className={`${ui.button} ${ui.small}`} onClick={onBack}>
            {t(messages, "demo.legal.back")}
          </button>
        </div>
      </footer>
    </div>
  );
}
