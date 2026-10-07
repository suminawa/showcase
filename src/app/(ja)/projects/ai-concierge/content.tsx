/*
 * THESIS: 料紙の上に、窓を一つだけ開ける（Operate）。ここにある案内窓口は見本ではなく実物で、
 *   suminawa 自身の文書（売り物・受託・よくあるご質問）だけを根拠に答える。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。窓の中は部品の文法（--ac-* の値だけ料紙に寄せる）。
 * COLOR: 朱は落款だけ。窓の送信ボタンは墨。
 */
import Script from "next/script";

import "@suminawa/ai-concierge/ai-concierge.css";
import "./skin.css";

import type { Lang } from "@/i18n/routes";

import {
  AFTER_TOOL,
  ContactLine,
  DemoNote,
  ProjectShell,
  PurchaseNote,
  ShopLinks,
  projectMetadata,
} from "../shell";
import s from "../projects.module.css";
import { copy } from "./copy";

export const metadataFor = (lang: Lang) => projectMetadata(lang, "ai-concierge", copy[lang].meta);

export function Content({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <ProjectShell lang={lang} slug="ai-concierge" title={t.title} latin="Concierge" lede={t.lede}>
      <DemoNote lang={lang} />
      <div
        id="suminawa-concierge"
        style={
          {
            /* 紙の色と墨の四段は globals.css の --ryoushi-*。窓の中だけ、罫と同じ淡さの一本を持つ */
            "--ac-bg": "var(--ryoushi-paper)",
            "--ac-fg": "var(--ryoushi-sumi)",
            "--ac-muted": "var(--ryoushi-sumi-4)",
            "--ac-brand": "var(--ryoushi-sumi)",
            "--ac-brand-fg": "var(--ryoushi-paper)",
            "--ac-border": "color-mix(in srgb, var(--ryoushi-sumi) 26%, transparent)",
            "--ac-radius": "0px",
            /* inherit は var() の中では字の名として読めず、既定のゴシックに落ちていた（2026-10-07） */
            "--ac-font": "var(--hi-mincho), 'Hiragino Mincho ProN', 'Yu Mincho', YuMincho, serif",
            "--ac-shadow": "none",
          } as React.CSSProperties
        }
      />
      {/* 窓口の中は日本語のまま（読む文書が日本語の案内なので） */}
      <Script
        src="/ai-concierge.js"
        strategy="afterInteractive"
        data-endpoint="/api/concierge"
        data-inline="#suminawa-concierge"
        data-greeting="こんにちは。suminawa の案内窓口です。売り物の内容や価格、受託の料金、進め方などをお答えします。"
        data-suggestions="AI 案内窓口キットは何ができますか|GAS の自動化はいくらからですか|買ったあとの更新は無料ですか"
        data-contact-url="#contact"
        data-storage-key="suminawa"
        data-max-input-chars="300"
      />

      <p className={s.lede} style={AFTER_TOOL}>
        {t.sources}
      </p>
      <p className={s.lede}>
        {t.kit}
        <ShopLinks lang={lang} slug="ai-concierge" linkKey="ai-concierge" />
      </p>
      <PurchaseNote lang={lang} />
      <ContactLine lang={lang} />
    </ProjectShell>
  );
}
